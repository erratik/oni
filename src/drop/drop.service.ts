import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { InjectionTokens } from '../app.constants';
import { PassportLocalModel } from 'passport-local-mongoose';
import { IDropService } from './interfaces/idrop.service';
import { IDropSet } from './interfaces/drop-set.schema';
import { IDropItem } from './interfaces/drop-item.schema';
import { IDropSchema } from '../drop-schemas/interfaces/drop-schema.schema';
import { AttributeService } from '../attributes/attributes.service';
import { DropSetDto } from './dto/drops.dto';

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

  public async addDrops(space: string, owner: string, drops: IDropItem[], navigation = {}, type = 'default'): Promise<IDropItem[]> {
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
    return this.upsertDropSet(
      space,
      owner,
      {
        space,
        $addToSet: { drops: Object.keys(insert.insertedIds).map(x => insert.insertedIds[x].toString()) },
        navigation,
      },
      type
    )
      .then(dropSet => dropSet)
      .catch(error => error.message);
  }

  public async upsertDropSet(space: string, owner: string, update = {}, type = 'default'): Promise<IDropSet> {
    this.logger.log(`[DropService]`, `Upserting ${space} drop set for ${owner}`);
    return this.dropSetModel
      .findOneAndUpdate({ space, owner, type }, update, { upsert: true, new: true, runValidators: true })
      .then((dropSet: IDropSet) => ({ ...dropSet.toObject() }))
      .catch(error => error);
  }

  public async createDropSet(space: string, owner: string, dropSet: DropSetDto): Promise<IDropSet> {
    this.logger.log(`[DropService]`, `Adding ${space} drop set for ${owner}`);
    // const createdSet = new this.dropSetModel({ ...settingsDto, owner });
    // return await createdSettings.save();
    return this.dropSetModel
      .create({ ...dropSet, space, owner })
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
    const dropItems: IDropItem[] = await this.dropItemModel.find(query, projection).sort(sorter);
    return dropItems ? dropItems.map(items => ({ ...items.toObject() })) : null;
  }

  public async getDropSet(query: any): Promise<IDropSet> {
    this.logger.log(`[DropService]`, `Getting ${query.space} drop set for ${query.owner}`);
    const dropSet: IDropSet = await this.dropSetModel.findOne(query);
    return dropSet ? { ...dropSet.toObject() } : null;
  }

  public async getDrop(query: any, sorter = {}, projection = {}): Promise<IDropItem> {
    this.logger.log(`[DropService]`, `Getting drop for ${query.owner}`);
    const dropItem: IDropSet = await this.dropItemModel.findOne(query, projection).sort(sorter);
    return dropItem ? { ...dropItem.toObject() } : null;
  }

  public async getDrops(query: any, limit = 20, sorter = {}, projection = {}): Promise<IDropItem[]> {
    this.logger.log(`[DropService]`, `Getting drop for ${query.owner}`);
    const dropItems: IDropSet[] = await this.dropItemModel
      .find(query, projection)
      .sort(sorter)
      .limit(limit);
    return dropItems ? dropItems.map(items => ({ ...items.toObject() })) : null;
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
