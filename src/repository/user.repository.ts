import { LoggerService } from '../shared/services/logger.service';
import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectionTokens } from '../app.constants';
import { Projections } from './projections.constants';
import { BaseRepository } from './base.repository';
import { UserModel } from './document.interfaces';

@Injectable()
export class UserRepository extends BaseRepository {
  constructor(
    @Inject(InjectionTokens.UserModel)
    readonly model: Model<UserModel>,
    logger: LoggerService
  ) {
    super(model, logger);
  }

  public itemType: string = 'User';

  //                                                                                                      //
  //? Retrieve
  //                                                                                                      //

  public async getUserById(id: string): Promise<UserModel | null> {
    this.logger.log(`[${this.itemType}Repository]`, `Fetching ${this.itemType} with id: ${id}`);
    const user = await this.model.findById(id);
    return user ? { ...user.toObject() } : null;
  }

  public async getUserByName(username: string): Promise<UserModel | null> {
    this.logger.log(`[${this.itemType}Repository]`, `Fetching ${this.itemType} with username: ${username}`);
    const user = await this.model.findOne({ username });
    return user ? { ...user.toObject() } : null;
  }

  public async getUsersByName(query: any): Promise<Array<UserModel>> {
    this.logger.log(`[${this.itemType}Repository]`, `Fetching ${this.itemType}s with query: ${JSON.stringify(query)}`);
    const users = await this.model
      .find({
        username: { $regex: new RegExp(query, 'i') },
      })
      .select(Projections.User)
      .sort({ username: 1 });
    return users.map(user => ({ ...user.toObject() }));
  }

  public async getUser(clauses: {}, projection = Projections.User): Promise<UserModel> {
    this.logger.log(`[${this.itemType}Repository]`, `Fetching ${this.itemType}s with clauses: ${JSON.stringify(clauses)}`);
    const user = await this.model.findOne(clauses, projection);
    return user ? { ...user.toObject() } : null;
  }

  public async getUsers(clauses: {}, sorter?: {}, projection = Projections.User, offset?: number, limit?: number): Promise<Array<UserModel>> {
    this.logger.log(`[${this.itemType}Repository]`, `Fetching ${this.itemType}s with clauses: ${JSON.stringify(clauses)}`);
    const users = await this.buildQuery(clauses, sorter, projection);
    return users.map(user => ({ ...user.toObject() }));
  }

  //                                                                                                      //
  //? Update / Create
  //                                                                                                      //

  public async updateUser(user: UserModel): Promise<UserModel> {
    this.logger.log(`[${this.itemType}Repository]`, `Updating ${this.itemType}: ${user.username}`);
    return this.model
      .findOneAndUpdate({ username: user.username }, user, { upsert: true, new: true, runValidators: true })
      .then(user => ({ ...user.toObject() }));
  }
}
