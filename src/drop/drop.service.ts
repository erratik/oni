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
import { DropType } from './drop.constants';
import { Projections } from '../shared/repository/projections.constants';

@Injectable()
export class DropService implements IDropService {
  public constructor(
    @Inject(InjectionTokens.DropSetModel) private readonly dropSetModel: PassportLocalModel<IDropSet>,
    @Inject(InjectionTokens.DropItemModel) private readonly dropItemModel: PassportLocalModel<IDropItem>,
    public logger: LoggerService,
    public attributeService: AttributeService,
  ) {}

  // ? Create & Update
  //                                                                                                      //

  public async addDrops(space: string, owner: string, drops: IDropItem[], navigation: any, type = DropType.Default): Promise<IDropSet> {
    let skippedUpdate = false;
    let duplicates;
    let duplicateCount: number = 0;
    let otherErrCount: number = 0;
    const insert = await this.dropItemModel.collection.insert(drops).catch(e => {
      skippedUpdate = e.writeErrors ? e.writeErrors.length === drops.length : false;

      if (!skippedUpdate) {
        if (e.writeErrors) {
          duplicates = e.writeErrors.filter(({ code }) => code === 11000).map(({ index }) => index);
          duplicateCount = duplicates.length;
          otherErrCount = e.writeErrors.length - duplicateCount;
          this.logger.log('[DropService]', `Skipped ${duplicateCount} duplicates`);
          if (otherErrCount) this.logger.warn('[DropService]', `There were ${otherErrCount} other errors  🙀`);
        }
        const insertedIds = e.result.getInsertedIds().filter(drop => !duplicates.some(index => index === drop.index));
        return { insertedIds, wasPartial: true };
      }

      this.logger.log('[DropService]', `No drops to add in ${space} dropset, all already exist`);
      return this.dropSetModel.findOne({ space, owner, type }).then(dropSet => dropSet.toObject());
    });
    if (skippedUpdate) return insert;

    const insertDropCount = !!insert.wasPartial ? insert.insertedIds.length : insert.insertedCount;
    this.logger.log('[DropService]', `💧  Added (${insertDropCount - otherErrCount}) ${type} drops to ${space} schema for ${owner}`);
    const addedDrops: string[] = !!insert.wasPartial
      ? insert.insertedIds.map(({ _id }) => _id.toString())
      : Object.keys(insert.insertedIds).map(x => insert.insertedIds[x].toString());

    return this.upsertDropSet(
      space,
      owner,
      {
        space,
        navigation,
        $addToSet: { drops: addedDrops },
      },
      type,
    )
      .then((dropSet: IDropSet) => ({
        dropSet,
        stats: {
          skippedUpdate,
          addedDrops,
          duplicateCount,
          otherErrCount,
          type,
          space,
          owner,
        },
      }))
      .catch(error => error.message);
  }

  public async upsertDropSet(space: string, owner: string, update = {}, type = DropType.Default): Promise<IDropSet> {
    this.logger.log('[DropService]', `Upserting ${space} ${type} drop set for ${owner}`);
    return this.dropSetModel
      .findOneAndUpdate({ space, owner, type }, update, { upsert: true, new: true, runValidators: true })
      .then((dropSet: IDropSet) => ({ ...dropSet.toObject() }))
      .catch(error => error.message);
  }

  public async createDropSet(space: string, owner: string, dropSet: DropSetDto): Promise<IDropSet> {
    this.logger.log('[DropService]', `Adding ${space} drop set for ${owner}`);
    return this.dropSetModel
      .create({ ...dropSet, space, owner })
      .then((dropSet: IDropSet) => ({ ...dropSet.toObject() }))
      .catch(error => error.message);
  }

  // ? Retrieve

  // todo: CRUD on drop schemas
  public async getDropSchema(query: any): Promise<IDropSchema> {
    this.logger.log('[DropService]', `Fetching ${query.space} drop schema for  ${query.owner}`);
    const dropSet: IDropSet = await this.dropSetModel.findOne(query).populate('schemas');
    return dropSet ? { ...dropSet.toObject() } : null;
  }

  public async getDropSet(query: any): Promise<IDropSet> {
    this.logger.log('[DropService]', `Getting ${query.space} drop set for ${query.owner}`);
    const dropSet: IDropSet = await this.dropSetModel.findOne(query);
    return dropSet ? { ...dropSet.toObject() } : null;
  }

  public async getDropSets(query?: any): Promise<IDropSet[]> {
    this.logger.log('[DropService]', 'Getting drop sets');
    const dropSets: IDropSet[] = await this.dropSetModel.find(query || {}).select(Projections.DropSets);
    return dropSets ? dropSets.map(dropSet => ({ ...dropSet.toObject() })) : null;
  }

  public async getDrop(query: any, sorter = {}, projection = {}): Promise<IDropItem> {
    this.logger.log('[DropService]', `Getting drop for ${query.owner}`);
    const dropItem: IDropSet = await this.dropItemModel.findOne(query, projection).sort(sorter);
    return dropItem ? { ...dropItem.toObject() } : null;
  }

  public async getDrops(query: any, limit = 20, sorter = {}, projection = {}): Promise<IDropItem[]> {
    this.logger.log('[DropService]', `Getting drop for ${query.owner}`);
    const dropItems: IDropSet[] = await this.dropItemModel
      .find(query, projection)
      .sort(sorter)
      .limit(limit);
    return dropItems ? dropItems.map(items => ({ ...items.toObject() })) : null;
  }

  public async getDropsBySpace(query: any, sorter = {}, projection = {}): Promise<IDropItem[]> {
    this.logger.log('[DropService]', `Getting ${query.space} drops for ${query.owner}`);
    const dropItems: IDropItem[] = await this.dropItemModel.find(query, projection).sort(sorter);
    return dropItems ? dropItems.map(items => ({ ...items.toObject() })) : null;
  }

  //                                                                                                      //
  // ! Delete
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
