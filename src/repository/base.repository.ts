import { LoggerService } from '../shared/services/logger.service';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserModel } from './document.interfaces';
// import { scopePipeline } from '../aggregations/scope.aggregation';

@Injectable()
export class BaseRepository {
  public constructor(public readonly model: Model<UserModel>, public logger: LoggerService) {}

  /**
   * @param clauses query fields { username: "erratik" }
   * @param sorter sort fields { label: 1 }
   * @param projection projectfields { createdBy: 1 }
   * @param offset skip //? not sure about this yet
   * @param limit limit //? not sure about this yet
   */
  public buildQuery(clauses: {}, sorter?: {}, projection?: {}, offset?: number, limit?: number): Promise<Array<UserModel>> {
    let query: any;

    query = this.model.find(clauses).sort(sorter);
    this.logger.log('[BaseRepository]', `buildQuery > > > ${JSON.stringify(clauses)}`);

    query.select(projection);

    return this.runQuery(query, offset, limit);
  }

  /**
   *
   * @param query response from query
   * @param offset skip //? not sure about this yet
   * @param limit limit //? not sure about this yet
   */
  public runQuery(query: any, offset?: number, limit?: number) {
    // if (offset !== undefined && limit !== undefined) {
    //   return query.then(items => ({ total: items.total, result: items.docs.map(document => ({ id: document.id, ...document.toObject() }))}));
    // }
    this.logger.log('[BaseRepository]', `runQuery > > > `);
    return query.then(results => results.map(document => ({ id: document.id, ...document.toObject() })));
  }

  //** get a model by id
  public async getById(id: string): Promise<UserModel | null> {
    this.logger.log('BaseRepository', `Fetching Item with id ${id}`);
    const result = await this.model.findById(id);
    return result ? { id: result.id, ...result.toObject() } : null;
  }

  //                                                                                                      //
  //! Delete
  //! super danger alert, maybe privileges should be enforced
  //                                                                                                      //
  public async dropCollection(): Promise<void> {
    this.logger.log(`[BaseRepository]`, `Dropping Collection`);
    await this.model.remove({});
  }
}
