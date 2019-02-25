import { LoggerService } from '../shared/services/logger.service';
import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectionTokens } from '../app.constants';
import { MongoProjections } from './projections.constants';
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

  //! super danger alert, maybe privileges should be enforced
  public async dropCollection(): Promise<void> {
    this.logger.log('BaseRepository', `Dropping Collection`);
    await this.model.remove({});
  }
  // Get all data for all reporting spaces

  // public getAllReportingSpaces(offset?: number, limit?: number): Promise<Array<UserModel>> {
  //   this.logger.log('ReportingSpaceRepository', `Getting All Reporting Spaces`);

  //   return this.buildQuery({}, offset, limit);
  // }

  // public getAllDisabledReportingSpaces(offset?: number, limit?: number): Promise<Array<UserModel>> {
  //   this.logger.log('ReportingSpaceRepository', `Getting All Disabled Reporting Spaces`);

  //   return this.buildQuery({ enabled: false }, offset, limit);
  // }

  // public getAllEnabledReportingSpaces(offset?: number, limit?: number): Promise<Array<UserModel>> {
  //   this.logger.log('ReportingSpaceRepository', `Getting All Enabled Reporting Spaces`);

  //   return this.buildQuery({ enabled: true }, offset, limit);
  // }

  // Get all reporting spaces for a displayName search

  // public async getReportingSpacesByDisplayName(query: string): Promise<Array<UserModel>> {
  //   const result = await this.userModel
  //     .find({
  //       displayName: { $regex: new RegExp(query, 'i') },
  //     })
  //     .select(this.selectDetails)
  //     .sort({ displayName: 1 });
  //   return result.map(x => ({ id: x.id, ...x.toObject() }));
  // }

  // Get Scopes
  // public getReportingScopes(): Promise<Array<ReportingScopeDBModel>> {
  //   this.logger.log('ReportingSpaceRepository', `Aggregating Reporting Spaces as Grouped Scopes`);
  //   return this.userModel.aggregate(scopePipeline)
  //     .then(result => result.map(x => ({ id: x._id, ...x })));
  // }

  // // Create

  // public async addReportingSpace(reportingSpace: UserModel): Promise<UserModel> {
  //   this.logger.log('ReportingSpaceRepository', `Adding Reporting Space`);
  //   const result = await this.userModel.create(reportingSpace);
  //   return { id: result.id, ...result.toObject() };
  // }

  // // Update

  // public async updateReportingSpace(reportingSpaceId: string, reportingSpace: UserModel): Promise<UserModel> {
  //   this.logger.log('ReportingSpaceRepository', `Updating Reporting Space ${reportingSpaceId}`);
  //   return this.userModel
  //     .findByIdAndUpdate(reportingSpaceId, reportingSpace, { upsert: true, new: true, runValidators: true })
  //     .then(result => ({ id: result.id, ...result.toObject() }));
  // }

  // // Delete

  // public async deleteReportingSpaceById(reportingSpaceId: string): Promise<ReportingSpaceDeleteModel> {
  //   this.logger.log('ReportingSpaceRepository', `Deleting Reporting Space ${reportingSpaceId}`);
  //   const result = await this.userModel.findById(reportingSpaceId).remove();
  //   return result.n === 1
  //     ? { reportingSpaceId, response: ResponseMessages.Success, responseCode: 200 }
  //     : { reportingSpaceId, response: ResponseMessages.FailureDelete, responseCode: 500 };
  // }
}
