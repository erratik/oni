import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { InjectionTokens } from '../app.constants';
import { PassportLocalModel } from 'passport-local-mongoose';
import { IDropService } from './interfaces/idrop.service';
import { IDropSet } from './interfaces/drop-set.schema';
import { IDropItem } from './interfaces/drop-item.schema';
import { IDropSchema } from '../drop-schemas/interfaces/drop-schema.schema';
import { AttributeService } from '../attributes/attributes.service';

@Injectable()
export class DropService implements IDropService {
  public constructor(
    @Inject(InjectionTokens.DropSetModel) private readonly dropSetModel: PassportLocalModel<IDropSet>,
    @Inject(InjectionTokens.DropItemModel) private readonly dropItemModel: PassportLocalModel<IDropItem>,
    public logger: LoggerService,
    public attributeService: AttributeService
  ) {}

  //? Create & Update
  //                                                                                                      //

  public async addDrops(space: string, owner: string, drops: IDropItem[], navigation = {}): Promise<IDropItem[]> {
    let skipUpdate = false;
    const insert = await this.dropItemModel.collection.insert(drops).catch(e => {
      if (e) {
        skipUpdate = true;
        this.logger.log(`[DropService]`, `No drops to add, they already exist`);
        return this.dropSetModel.findOne({ space, owner }).then(dropSet => dropSet.toObject());
      }
    });
    if (skipUpdate) {
      return insert;
    }
    this.logger.log(`[DropService]`, `Added (${insert.insertedIds.length}) drops ${space} drop schema for ${owner}`);
    return this.upsertDropSet(space, owner, {
      space,
      $addToSet: { drops: Object.keys(insert.insertedIds).map(x => insert.insertedIds[x].toString()) },
      navigation,
    })
      .then(dropSet => dropSet)
      .catch(error => error.message);
  }

  public async upsertDropSet(space: string, owner: string, update = {}): Promise<IDropSet> {
    this.logger.log(`[DropService]`, `Upserting ${space} drop schema for ${owner}`);
    return this.dropSetModel
      .findOneAndUpdate({ space, owner }, update, { upsert: true, new: true, runValidators: true })
      .then((dropSet: IDropSet) => ({ ...dropSet.toObject() }))
      .catch(error => error);
  }

  //                                                                                                      //
  //? Retrieve

  // todo: CRUD on drop schemas
  public async getDropSchema(query: any): Promise<IDropSchema> {
    this.logger.log(`[DropService]`, `Fetching ${query.space} drop schema for  ${query.owner}`);
    const dropSet: IDropSet = await this.dropSetModel.findOne(query).populate('schemas');
    return dropSet ? { ...dropSet.toObject() } : null;
  }

  public async getDropsBySpace(query: any, sorter = {}, projection = {}): Promise<IDropItem[]> {
    this.logger.log(`[DropService]`, `Getting ${query.space} drops for ${query.owner}`);
    const dropItems: IDropItem[] = await this.dropItemModel.find(query, sorter, projection);
    return dropItems ? dropItems.map(items => ({ ...items.toObject() })) : null;
  }

  public async getDropSet(query: any): Promise<IDropSet> {
    this.logger.log(`[DropService]`, `Getting ${query.space} drop set for ${query.owner}`);
    const dropSet: IDropSet = await this.dropSetModel.findOne(query);
    return dropSet ? { ...dropSet.toObject() } : null;
  }

  public async getDrop(query: any, projection = {}): Promise<IDropItem> {
    this.logger.log(`[DropService]`, `Getting drop for ${query.owner}`);
    const drop: IDropSet = await this.dropItemModel.findOne(query);
    return drop ? { ...drop.toObject() } : null;
  }
  //                                                                                                      //
  //! Delete
  //                                                                                                      //

  async delete(owner: string, space: string): Promise<string> {
    try {
      await this.dropSetModel.findOneAndDelete({ space, owner }).exec();
      return `${owner}'s ${space} drop has been deleted`;
    } catch (err) {
      console.error(err);
      return `${owner}'s ${space} drop could not be deleted`;
    }
  }

  deleteDropSet?(owner: string, space: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
