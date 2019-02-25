import { LoggerService } from '../shared/services/logger.service';
import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectionTokens } from '../app.constants';
import { MongoProjections } from './projections.constants';
import { BaseRepository } from './base.repository';
import { UserModel } from './document.interfaces';
// import { scopePipeline } from '../aggregations/scope.aggregation';

@Injectable()
export class UserRepository extends BaseRepository {
  public itemType: string = 'User';
  constructor(
    @Inject(InjectionTokens.UserModel)
    readonly model: Model<UserModel>,
    logger: LoggerService,
  ) {
    super(model, logger);
  }

  //                                                                                                      //
  //*- Retrieve
  public async getUserById(id: string): Promise<UserModel | null> {
    this.logger.log(`[${this.itemType}Repository]`, `Fetching ${this.itemType} with id: ${id}`);
    const user = await this.model.findById(id);
    return user ? { id: user.id, ...user.toObject() } : null;
  }

  public async getUserByName(username: string): Promise<UserModel | null> {
    this.logger.log(`[${this.itemType}Repository]`, `Fetching ${this.itemType} with username: ${username}`);
    const user = await this.model.findOne({ username });
    return user ? { id: user.id, ...user.toObject() } : null;
  }

  public async getUsersByName(query: any): Promise<Array<UserModel>> {
    this.logger.log(`[${this.itemType}Repository]`, `Fetching ${this.itemType}s with query: ${JSON.stringify(query)}`);
    const users = await this.model
      .find({
        username: { $regex: new RegExp(query, 'i') },
      })
      .select(MongoProjections.Basic)
      .sort({ username: 1 });
    return users.map(user => ({ id: user.id, ...user.toObject() }));
  }

  public async getUser(clauses: {}, projection = MongoProjections.Basic): Promise<UserModel> {
    this.logger.log(`[${this.itemType}Repository]`, `Fetching ${this.itemType}s with clauses: ${JSON.stringify(clauses)}`);
    const user = await this.model.findOne(clauses, projection);
    return !!user ? user.toObject() : null;
  }

  public async getUsers(clauses: {}, sorter?: {}, projection = MongoProjections.Basic, offset?: number, limit?: number): Promise<Array<UserModel>> {
    this.logger.log(`[${this.itemType}Repository]`, `Fetching ${this.itemType}s with clauses: ${JSON.stringify(clauses)}`);
    const users = await this.buildQuery(clauses, sorter, projection);
    return users.map(user => ({ id: user.id, ...user.toObject() }));
  }

  //                                                                                                      //
  //*- Update

  public async updateUser(id: string, user: UserModel): Promise<UserModel> {
    this.logger.log(`[${this.itemType}Repository]`, `Updating ${this.itemType}: ${user.username} (${id})`);
    return this.model.findByIdAndUpdate(id, user, { upsert: true, new: true, runValidators: true }).then(user => ({ id: user.id, ...user.toObject() }));
  }

  //  TODO @ CREATE OPERATIONS -*/
  //! DELETE OPERATIONS -*/
  //! super danger alert, maybe privileges should be enforced
  public async dropCollection(): Promise<void> {
    this.logger.log('BaseRepository', `Dropping Collection`);
    await this.model.remove({});
  }

  // // Create

  // public async addReportingSpace(reportingSpace: UserModel): Promise<UserModel> {
  //   this.logger.log('ReportingSpaceRepository', `Adding Reporting Space`);
  //   const result = await this.userModel.create(reportingSpace);
  //   return { id: result.id, ...result.toObject() };
  // }

  // // Delete

  // public async deleteReportingSpaceById(reportingSpaceId: string): Promise<ReportingSpaceDeleteModel> {
  //   this.logger.log('ReportingSpaceRepository', `Deleting Reporting Space ${reportingSpaceId}`);
  //   const result = await this.userModel.findById(reportingSpaceId).remove();
  //   return result.n === 1 ? { reportingSpaceId, response: ResponseMessages.Success, responseCode: 200 }
  //     : { reportingSpaceId, response: ResponseMessages.FailureDelete, responseCode: 500 };
  // }
}
