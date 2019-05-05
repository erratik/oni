import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { InjectionTokens } from '../app.constants';
import { PassportLocalModel } from 'passport-local-mongoose';
import { IDropSchemaService } from './interfaces/idropschema.service';
import { IDropSchema, IDropKey } from './interfaces/drop-schema.schema';
import { DropSchemaDto } from './dto/drop-schema.dto';
import { ISettings } from '../settings/interfaces/settings.schema';

@Injectable()
export class DropSchemaService implements IDropSchemaService {
  public constructor(
    @Inject(InjectionTokens.DropSchemaModel) private readonly dropSchemaModel: PassportLocalModel<IDropSchema>,
    public logger: LoggerService
  ) {}

  public upsertDropSchema(dropSchema: DropSchemaDto): Promise<IDropSchema> {
    this.logger.log(`[DropSchemaService]`, `Upserting ${dropSchema.space} drop schema for ${dropSchema.owner}`);

    return this.dropSchemaModel
      .findOneAndUpdate({ space: dropSchema.space, owner: dropSchema.owner, type: dropSchema.type }, dropSchema, {
        upsert: true,
        runValidators: true,
      })
      .then((dropSchema: IDropSchema) => ({ ...dropSchema.toObject() }))
      .catch(error => error);
  }

  public addDropSchemas(dropSchemas: DropSchemaDto[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async getDropSchema(query: any, sorter = {}, projection = {}): Promise<IDropSchema> {
    this.logger.log(`[DropSchemaService]`, `Getting ${query.space} dropSchemas`);
    const dropSchema: IDropSchema = await this.dropSchemaModel.findOne(query, sorter, projection).populate('keyMap.attribute');
    const keyMap: IDropKey[] = dropSchema.keyMap.map(k => k.toObject());
    return dropSchema ? { ...dropSchema.toObject(), keyMap } : null;
  }

  public async getDropSchemas(query: any, sorter = {}, projection = {}): Promise<IDropSchema[]> {
    this.logger.log(`[DropSchemaService]`, `Getting ${query.space} dropSchemas`);
    const dropSchemas: IDropSchema[] = await this.dropSchemaModel.find(query, sorter, projection);
    return dropSchemas ? dropSchemas.map(items => ({ ...items.toObject() })) : null;
  }

  //                                                                                                      //
  //! Delete
  //                                                                                                      //

  deleteDropSchemas(id: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
