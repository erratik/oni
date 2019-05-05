import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { InjectionTokens } from '../app.constants';
import { PassportLocalModel } from 'passport-local-mongoose';
import { AttributeSchemaDto } from './dto/attributes.dto';
import { IAttributeService } from './interfaces/iattribute.service';
import { IAttribute } from './interfaces/attribute.schema';

@Injectable()
export class AttributeService implements IAttributeService {
  public constructor(@Inject(InjectionTokens.AttributeModel) private readonly attributeModel: PassportLocalModel<IAttribute>, public logger: LoggerService) {}

  async addAttributes(attributes: AttributeSchemaDto[]): Promise<void> {
    const insert = await this.attributeModel.collection.insert(attributes).catch(e => {
      if (e) {
        this.logger.log(`[AttributeService]`, `No attributes to add`);
      }
    });
  }

  addAttribute(attribute: AttributeSchemaDto): Promise<IAttribute> {
    throw new Error('Method not implemented.');
  }

  public async getAttributes(query: any, sorter = {}, projection = {}): Promise<IAttribute[]> {
    this.logger.log(`[AttributeService]`, `Getting attributes`);
    const attributes: IAttribute[] = await this.attributeModel.find(query, sorter, projection);
    return attributes ? attributes.map(item => ({ id: item.id, ...item.toObject() })) : null;
  }

  public async updateAttribute(query: any, update = {}, projection = {}): Promise<IAttribute[]> {
    this.logger.log(`[AttributeService]`, `Upserting attributes`);
    return this.attributeModel
      .findOneAndUpdate(query, update, { upsert: true, runValidators: true })
      .then((attribute: IAttribute) => ({ ...attribute.toObject() }))
      .catch(error => error);
  }

  //                                                                                                      //
  //! Delete
  //                                                                                                      //

  deleteAttributes(id: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
