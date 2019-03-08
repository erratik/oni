import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { InjectionTokens } from '../app.constants';
import { IUser } from '../repository/schemas/user.schema';
import { IUsersService } from './interfaces/iusers.service';
import { PassportLocalModel } from 'mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { debug } from 'util';
import { Projections } from '../repository/projections.constants';

@Injectable()
export class UserService implements IUsersService {
  public itemType: string = 'User';
  public constructor(
    @Inject(InjectionTokens.UserModel) private readonly userModel: PassportLocalModel<IUser>,
    public logger: LoggerService
  ) {}
  async findAll(): Promise<IUser[]> {
    return await this.userModel.find().exec();
  }

  async findOne(options: object): Promise<IUser> {
    return await this.userModel.findOne(options).exec();
  }

  async findById(ID: number): Promise<IUser> {
    return await this.userModel.findById(ID).exec();
  }

  async create(createUserDto: CreateUserDto): Promise<IUser> {
    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  async update(ID: number, newValue: IUser): Promise<IUser> {
    const user = await this.userModel.findById(ID).exec();

    if (!user._id) {
      debug('user not found');
    }

    await this.userModel.findByIdAndUpdate(ID, newValue).exec();
    return await this.userModel.findById(ID).exec();
  }

  async delete(ID: number): Promise<string> {
    try {
      await this.userModel.findByIdAndRemove(ID).exec();
      return 'The user has been deleted';
    } catch (err) {
      debug(err);
      return 'The user could not be deleted';
    }
  }

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
    this.logger.log('[BaseRepository]', `buildQuery > > > ${JSON.stringify(clauses)}`);

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
    this.logger.log('[BaseRepository]', `runQuery > > > `);
    return query.then(results => results.map(document => ({ id: document.id, ...document.toObject() })));
  }

  //                                                                                                      //
  //? Retrieve
  //                                                                                                      //

  public async getUserById(id: string): Promise<IUser | null> {
    this.logger.log(`[${this.itemType}Repository]`, `Fetching ${this.itemType} with id: ${id}`);
    const user = await this.userModel.findById(id);
    return user ? { ...user.toObject() } : null;
  }

  public async getUserByName(username: string): Promise<IUser | null> {
    this.logger.log(`[${this.itemType}Repository]`, `Fetching ${this.itemType} with username: ${username}`);
    const user = await this.findOne({ username });
    return user ? { ...user.toObject() } : null;
  }

  public async getUsersByName(query: any): Promise<Array<IUser>> {
    this.logger.log(`[${this.itemType}Repository]`, `Fetching ${this.itemType}s with query: ${JSON.stringify(query)}`);
    const users = await this.userModel
      .find({
        username: { $regex: new RegExp(query, 'i') },
      })
      .select(Projections.User)
      .sort({ username: 1 });
    return users.map(user => ({ ...user.toObject() }));
  }

  public async getUser(clauses: {}, projection = Projections.User): Promise<IUser> {
    this.logger.log(
      `[${this.itemType}Repository]`,
      `Fetching ${this.itemType}s with clauses: ${JSON.stringify(clauses)}`
    );
    const user = await this.userModel.findOne(clauses, projection);
    return user ? { ...user.toObject() } : null;
  }

  public async getUsers(clauses: {}, sorter?: {}, projection = Projections.User): Promise<Array<IUser>> {
    this.logger.log(
      `[${this.itemType}Repository]`,
      `Fetching ${this.itemType}s with clauses: ${JSON.stringify(clauses)}`
    );
    const users = await this.buildQuery(clauses, sorter, projection);
    return users.map(user => ({ ...user.toObject() }));
  }

  //                                                                                                      //
  //? Update / Create
  //                                                                                                      //

  public async updateUser(user: IUser): Promise<IUser> {
    this.logger.log(`[${this.itemType}Repository]`, `Updating ${this.itemType}: ${user.username}`);
    return this.userModel
      .findOneAndUpdate({ username: user.username }, user, { upsert: true, new: true, runValidators: true })
      .then(user => ({ ...user.toObject() }));
  }
}
