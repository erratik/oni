import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { InjectionTokens, Sources } from '../app.constants';
import { ISettings, ICredentials, IAuthorization } from './interfaces/settings.schema';
import { ISettingsService } from './interfaces/isettings.service';
import { PassportLocalModel } from 'passport-local-mongoose';
import { SettingsDto } from './dto/settings.dto';
import { debug } from 'util';
import { Projections } from '../shared/repository/projections.constants';

@Injectable()
export class SettingsService implements ISettingsService {
  public constructor(@Inject(InjectionTokens.SettingsModel) private readonly settingsModel: PassportLocalModel<ISettings>, public logger: LoggerService) {}

  //                                                                                                      //
  // ** Query Helpers
  //                                                                                                      //

  /**
   * @param clauses query fields { name: "erratik" }
   * @param sorter sort fields { label: 1 }
   * @param projection projectfields { createdBy: 1 }
   * @param offset skip //? not sure about this yet
   * @param limit limit //? not sure about this yet
   */
  public buildQuery(clauses: {}, sorter?: {}, projection?: {}): Promise<Array<ISettings>> {
    let query: any;

    query = this.settingsModel.find(clauses).sort(sorter);
    this.logger.log('[SettingsService]', `buildQuery > > > ${JSON.stringify(clauses)}`);
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
    this.logger.log('[SettingsService]', 'runQuery > > > ');
    return query.then(results => results.map(document => ({ id: document.id, ...document.toObject() })));
  }

  //                                                                                                      //
  // ? Create & Update
  //                                                                                                      //

  public async create(settingsDto: SettingsDto, owner: string): Promise<ISettings> {
    const createdSettings = new this.settingsModel({ ...settingsDto, owner });
    return await createdSettings.save();
  }

  public async update(owner: string, space: Sources, settings: ISettings): Promise<ISettings> {
    this.logger.log('[SettingsService]', `Updating credentials for ${space}`);
    return this.settingsModel
      .findOneAndUpdate({ space, owner }, settings, { upsert: true, new: true, runValidators: true })
      .then((settings: ISettings) => {
        return { ...settings.toObject() };
      })
      .catch(err => debug(err));
  }

  //                                                                                                      //
  // ? Retrieve
  //                                                                                                      //

  public async findAll(): Promise<ISettings[]> {
    return await this.settingsModel.find().exec();
  }

  public async findById(id: string): Promise<ISettings> {
    this.logger.log('[SettingsService]', `Fetching Setting with id: ${id}`);
    const settings: ISettings = await this.settingsModel.findById(id);
    return settings ? { ...settings.toObject() } : null;
  }

  public async getSpaceCredentials(owner: string, space: string): Promise<ICredentials> {
    this.logger.log('[SettingsService]', `Fetching ${owner}'s credentials for ${space}`);
    const settings: ISettings = await this.settingsModel.findOne({ owner, space });
    return settings ? { ...settings.credentials.toObject() } : null;
  }

  public async getSpaceAuthorization(owner: string, space: string): Promise<IAuthorization> {
    this.logger.log('[SettingsService]', `Fetching ${owner}'s authorization for ${space}`);
    const settings: ISettings = await this.settingsModel.findOne({ owner, space });
    return settings ? { ...settings.authorization.toObject() } : null;
  }

  public async getSettingsBySpace(owner: string, space: string): Promise<ISettings | null> {
    this.logger.log('[SettingsService]', `Fetching Setting with name: ${space}`);
    const settings: ISettings = await this.settingsModel.findOne({ owner, space }).populate('authorization.info');
    return settings ? { ...settings.toObject() } : null;
  }

  public async getSettings(clauses: {}): Promise<ISettings[]> {
    this.logger.log('[SettingsService]', `Fetching Settings with clauses: ${JSON.stringify(clauses)}`);
    const settings: ISettings[] = await this.settingsModel.find(clauses).populate('authorization.info');
    return settings.map(settings => ({ ...settings.toObject() }));
  }

  public async search(space: any): Promise<ISettings[]> {
    this.logger.log('[SettingsService]', `Fetching Settings with names that match: ${JSON.stringify(space)}`);
    const settings = await this.settingsModel
      .find({
        space: { $regex: new RegExp(space, 'i') },
      })
      .select(Projections.Settings)
      .sort({ space: 1 });
    return settings.map(settings => ({ ...settings.toObject() }));
  }

  //                                                                                                      //
  // ! Delete
  //                                                                                                      //

  async delete(owner: string, space: string): Promise<string> {
    this.logger.log('[SettingsService]', `Deleting ${space} settings for ${owner}`);
    try {
      await this.settingsModel.findOneAndDelete({ owner, space }).exec();
      return `${space} settings for ${owner} has been deleted`;
    } catch (err) {
      debug(err);
      return `${space} space for ${space} could not be deleted`;
    }
  }
}
