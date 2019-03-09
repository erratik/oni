import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { InjectionTokens } from '../app.constants';
import { ISpace } from './interfaces/space.schema';
import { ISpacesService } from './interfaces/ispaces.service';
import { PassportLocalModel } from 'mongoose';
import { SpaceDto } from './dto/space.dto';
import { debug } from 'util';
import { Projections } from '../shared/repository/projections.constants';

@Injectable()
export class SpaceService implements ISpacesService {
  public itemType: string = 'Space';
  public constructor(
    @Inject(InjectionTokens.SpaceModel) private readonly spaceModel: PassportLocalModel<ISpace>,
    public logger: LoggerService
  ) {}

  //                                                                                                      //
  //** Query Helpers
  //                                                                                                      //

  /**
   * @param clauses query fields { name: "erratik" }
   * @param sorter sort fields { label: 1 }
   * @param projection projectfields { createdBy: 1 }
   * @param offset skip //? not sure about this yet
   * @param limit limit //? not sure about this yet
   */
  public buildQuery(clauses: {}, sorter?: {}, projection?: {}): Promise<Array<ISpace>> {
    let query: any;

    query = this.spaceModel.find(clauses).sort(sorter);
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
  //? Create & Update
  //                                                                                                      //

  public async create(spaceDto: SpaceDto): Promise<ISpace> {
    const createdSpace = new this.spaceModel(spaceDto);
    return await createdSpace.save();
  }

  public async update(spaceDto: SpaceDto): Promise<ISpace> {
    this.logger.log(`[${this.itemType}Repository]`, `Updating ${this.itemType}: ${spaceDto.name}`);
    return this.spaceModel
      .findOneAndUpdate({ name: spaceDto.name }, spaceDto, { upsert: true, new: true, runValidators: true })
      .then((space: ISpace) => ({ ...space.toObject() }))
      .catch(() => debug('space not found'));
  }

  //                                                                                                      //
  //? Retrieve
  //                                                                                                      //

  public async findAll(): Promise<ISpace[]> {
    return await this.spaceModel.find().exec();
  }

  public async findById(id: string): Promise<ISpace> {
    this.logger.log(`[${this.itemType}Repository]`, `Fetching ${this.itemType} with id: ${id}`);
    const space = await this.spaceModel.findById(id);
    return space ? { ...space.toObject() } : null;
  }

  public async getSpaceByName(name: string): Promise<ISpace | null> {
    this.logger.log(`[${this.itemType}Repository]`, `Fetching ${this.itemType} with name: ${name}`);
    const space = await this.spaceModel.findOne({ name });
    return space ? { ...space.toObject() } : null;
  }

  public async getSpace(clauses: {}, projection = Projections.Space): Promise<ISpace> {
    this.logger.log(
      `[${this.itemType}Repository]`,
      `Fetching ${this.itemType}s with clauses: ${JSON.stringify(clauses)}`
    );
    const space = await this.spaceModel.findOne(clauses, projection);
    return space ? { ...space.toObject() } : null;
  }

  public async getSpaces(clauses: {}, sorter?: {}, projection = Projections.Space): Promise<Array<ISpace>> {
    this.logger.log(
      `[${this.itemType}Repository]`,
      `Fetching ${this.itemType}s with clauses: ${JSON.stringify(clauses)}`
    );
    const spaces = await this.buildQuery(clauses, sorter, projection);
    return spaces.map(space => ({ ...space.toObject() }));
  }

  public async search(name: any): Promise<Array<ISpace>> {
    this.logger.log(
      `[${this.itemType}Repository]`,
      `Fetching ${this.itemType}s with names that match: ${JSON.stringify(name)}`
    );
    const spaces = await this.spaceModel
      .find({
        name: { $regex: new RegExp(name, 'i') },
      })
      .select(Projections.Space)
      .sort({ name: 1 });
    return spaces.map(space => ({ ...space.toObject() }));
  }

  //                                                                                                      //
  //! Delete
  //                                                                                                      //

  async delete(spaceDto: SpaceDto): Promise<string> {
    try {
      await this.spaceModel.findOneAndDelete({ name: spaceDto.name }).exec();
      return `${spaceDto.name} space has been deleted`;
    } catch (err) {
      debug(err);
      return `${spaceDto.name} space could not be deleted`;
    }
  }
}
