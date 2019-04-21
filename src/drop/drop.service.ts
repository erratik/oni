import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { InjectionTokens } from '../app.constants';
import { PassportLocalModel } from 'passport-local-mongoose';
import { DropSchemaDto } from './dto/drops.dto';
import { IDropService } from './interfaces/idrop.service';
import { IDropSet } from './interfaces/drop-set.schema';
import { IDropItem } from './interfaces/drop-item.schema';
import { IDropSchema } from './interfaces/drop-schema.schema';

@Injectable()
export class DropService implements IDropService {
  public constructor(
    @Inject(InjectionTokens.DropSetModel) private readonly dropSetModel: PassportLocalModel<IDropSet>,
    @Inject(InjectionTokens.DropItemModel) private readonly dropItemModel: PassportLocalModel<IDropItem>,
    public logger: LoggerService
  ) {}

  //? Create & Update
  //                                                                                                      //

  public async addDrops(drops: IDropItem[]): Promise<IDropItem[]> {
    const space = drops[0].space;
    const owner = drops[0].owner;
    return this.dropItemModel.collection
      .insertMany(drops)
      .then(async ({ insertedIds }) => {
        const updatedDropSet = await this.upsertDropSet({ space, owner, drops: insertedIds });
        return updatedDropSet;
      })
      .catch(async error => {
        if (error.message.includes('id_1 dup key')) {
          const drops = await this.dropItemModel.find({ space, owner }, {}, { _id: 1 });
          const updatedDropSet = await this.upsertDropSet({ space, owner, drops: drops.map(d => d._id) });
          return updatedDropSet;
        }
      });
  }

  public async upsertDropSet(dropSchemaDto: DropSchemaDto): Promise<IDropSet> {
    this.logger.log(`[DropService]`, `Upserting ${dropSchemaDto.space} drop schema for ${dropSchemaDto.owner}`);
    return this.dropSetModel
      .findOneAndUpdate(
        { space: dropSchemaDto.space },
        { space: dropSchemaDto.space, $addToSet: { drops: dropSchemaDto.drops.map(d => d._id) } },
        { upsert: true, new: true, runValidators: true }
      )
      .then((dropSet: IDropSet) => ({ ...dropSet.toObject() }))
      .catch(error => console.error(error));
  }

  public async updateDropSchema(schema: DropSchemaDto): Promise<IDropSchema> {
    debugger;
    throw new Error('Method not implemented.');
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
