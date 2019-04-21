import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { InjectionTokens } from '../app.constants';
import { IUser } from './interfaces/user.schema';
import { IUsersService } from './interfaces/iusers.service';
import { PassportLocalModel } from 'passport-local-mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { debug } from 'util';
import { Projections } from '../shared/repository/projections.constants';

@Injectable()
export class UserService implements IUsersService {
  public constructor(@Inject(InjectionTokens.UserModel) private readonly userModel: PassportLocalModel<IUser>, public logger: LoggerService) {}

  //                                                                                                      //
  //** Query Helpers
  //                                                                                                      //

  /**
   * @param clauses query fields { username: "erratik" }
   * @param sorter sort fields { label: 1 }
   * @param projection projectfields { createdBy: 1 }
   * @param offset skip //? not sure about this yet
   * @param limit limit //? not sure about this yet
   */
  public buildQuery(clauses: {}, sorter?: {}, projection?: {}, offset?: number, limit?: number): Promise<Array<IUser>> {
    let query: any;

    query = this.userModel.find(clauses).sort(sorter);
    this.logger.log('[UserService]', `buildQuery > > > ${JSON.stringify(clauses)}`);

    query.select(projection);

    return this.runQuery(query);
  }

  /**
   *
   * @param query response from query
   * @param offset skip //? not sure about this yet
   * @param limit limit //? not sure about this yet
   */
  public runQuery(query: any) {
    // if (offset !== undefined && limit !== undefined) {
    //   return query.then(items => ({ total: items.total, result: items.docs.map(document => ({ id: document.id, ...document.toObject() }))}));
    // }
    this.logger.log('[UserService]', `runQuery > > > `);
    return query.then(results => results.map(document => ({ id: document.id, ...document.toObject() })));
  }

  //                                                                                                      //
  //? Create & Update
  //                                                                                                      //

  public async create(createUserDto: CreateUserDto): Promise<IUser> {
    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  public async update(user: IUser): Promise<IUser> {
    this.logger.log(`[UserService]`, `Updating User: ${user.username}`);
    return this.userModel
      .findOneAndUpdate({ username: user.username }, user, { upsert: true, new: true, runValidators: true })
      .then(user => ({ ...user.toObject() }))
      .catch(() => debug('user not found'));
  }

  //                                                                                                      //
  //? Retrieve
  //                                                                                                      //

  public async findAll(): Promise<IUser[]> {
    return await this.userModel.find().exec();
  }

  public async findById(id: string): Promise<IUser> {
    this.logger.log(`[UserService]`, `Fetching User with id: ${id}`);
    const user = await this.userModel.findById(id);
    return user ? { id: user._id, ...user.toObject() } : null;
  }

  public async getUserByName(username: string): Promise<IUser | null> {
    this.logger.log(`[UserService]`, `Fetching User with username: ${username}`);
    const user = await this.userModel.findOne({ username });
    return user ? { ...user.toObject() } : null;
  }

  public async getUser(clauses: {}, projection = Projections.User): Promise<IUser> {
    this.logger.log(`[UserService]`, `Fetching Users with clauses: ${JSON.stringify(clauses)}`);
    const user = await this.userModel.findOne(clauses, projection);
    return user ? { ...user.toObject() } : null;
  }

  public async getUsers(clauses: {}, sorter?: {}, projection = Projections.User): Promise<Array<IUser>> {
    this.logger.log(`[UserService]`, `Fetching Users with clauses: ${JSON.stringify(clauses)}`);
    const users = await this.buildQuery(clauses, sorter, projection);
    return users.map(user => ({ ...user.toObject() }));
  }

  public async getUserByToken(token: string): Promise<IUser> {
    this.logger.log(`[UserService]`, `Fetching Users with token value: ${token}`);
    const user = await this.userModel.findOne({ authorization: { $elemMatch: { token } } });
    return user ? { ...user.toObject() } : null;
  }

  public async search(username: any): Promise<Array<IUser>> {
    this.logger.log(`[UserService]`, `Fetching Users with usernames that match: ${JSON.stringify(username)}`);
    const users = await this.userModel
      .find({
        username: { $regex: new RegExp(username, 'i') },
      })
      .select(Projections.User)
      .sort({ username: 1 });
    return users.map(user => ({ ...user.toObject() }));
  }

  //                                                                                                      //
  //! Delete
  //                                                                                                      //

  async delete(id: string): Promise<string> {
    try {
      await this.userModel.findByIdAndRemove(id).exec();
      return 'The user has been deleted';
    } catch (err) {
      debug(err);
      return 'The user could not be deleted';
    }
  }
}
