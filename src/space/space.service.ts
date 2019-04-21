import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { InjectionTokens } from '../app.constants';
import { ISpace } from './interfaces/space.schema';
import { ISpacesService } from './interfaces/ispaces.service';
import { PassportLocalModel } from 'passport-local-mongoose';
import { SpaceDto } from './dto/space.dto';
import { Projections } from '../shared/repository/projections.constants';

@Injectable()
export class SpaceService implements ISpacesService {
  public constructor(@Inject(InjectionTokens.SpaceModel) private readonly spaceModel: PassportLocalModel<ISpace>, public logger: LoggerService) {}

  //                                                                                                      //
  //** Query Helpers
  //                                                                                                      //

  /**
   * @param clauses query fields { name: "erratik" }
   * @param sorter sort fields { label: 1 }
   * @param projection projectfields { createdBy: 1 }
   */
  public buildQuery(clauses: {}, sorter?: {}, projection?: {}): Promise<Array<ISpace>> {
    let query: any;

    query = this.spaceModel.find(clauses).sort(sorter);
    this.logger.log('[SpaceService]', `buildQuery > > > ${JSON.stringify(clauses)}`);

    query.select(projection);

    return this.runQuery(query);
  }

  public runQuery(query: any) {
    this.logger.log('[SpaceService]', `runQuery > > > `);
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
    this.logger.log(`[SpaceService]`, `Updating Space: ${spaceDto.name}`);
    return this.spaceModel
      .findOneAndUpdate({ name: spaceDto.name }, spaceDto, { upsert: true, new: true, runValidators: true })
      .then((space: ISpace) => ({ ...space.toObject() }))
      .catch(error => console.error(error));
  }

  public async updateProfile(name: string, owner: string, profile: any): Promise<ISpace> {
    this.logger.log(`[SpaceService]`, `Updating ${owner}'s ${name} profile`);
    profile.owner = owner;
    return this.spaceModel
      .findOneAndUpdate({ name }, { name, $addToSet: { profiles: profile } }, { runValidators: true })
      .then(space => ({ ...space.toObject() }))
      .catch(error => console.error(error));
  }

  //                                                                                                      //
  //? Retrieve
  //                                                                                                      //

  public async findAll(): Promise<ISpace[]> {
    return await this.spaceModel.find().exec();
  }

  public async findById(id: string): Promise<ISpace> {
    this.logger.log(`[SpaceService]`, `Fetching Space with id: ${id}`);
    const space = await this.spaceModel.findById(id);
    return space ? { ...space.toObject() } : null;
  }

  public async getSpaceByName(name: string): Promise<ISpace | null> {
    this.logger.log(`[SpaceService]`, `Fetching Space with name: ${name}`);
    const space = await this.spaceModel.findOne({ name });
    return space ? { ...space.toObject() } : null;
  }

  public async getSpace(clauses: {}, sorter?: {}): Promise<ISpace> {
    this.logger.log(`[SpaceService]`, `Fetching Spaces with clauses: ${JSON.stringify(clauses)}`);
    const space = await this.spaceModel.findOne(clauses, sorter);
    return space ? { ...space.toObject() } : null;
  }

  public async getSpaces(clauses: {}, sorter?: {}): Promise<Array<ISpace>> {
    this.logger.log(`[SpaceService]`, `Fetching Spaces with clauses: ${JSON.stringify(clauses)}`);
    const spaces: ISpace[] = await this.buildQuery(clauses, sorter);
    return spaces.map(space => ({ ...space.toObject() }));
  }

  public async search(name: any): Promise<Array<ISpace>> {
    this.logger.log(`[SpaceService]`, `Fetching Spaces with names that match: ${JSON.stringify(name)}`);
    const spaces: ISpace[] = await this.spaceModel
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
      await this.spaceModel.findOneAndDelete({ name: spaceDto.name, owner: spaceDto.owner }).exec();
      return `${spaceDto.name} space has been deleted`;
    } catch (error) {
      console.error(error);
      return `${spaceDto.name} space could not be deleted`;
    }
  }
}
