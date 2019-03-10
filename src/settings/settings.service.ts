import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { InjectionTokens, Sources } from '../app.constants';
import { ISettings } from './interfaces/settings.schema';
import { ISettingsService } from './interfaces/isettings.service';
import { PassportLocalModel } from 'mongoose';
import { SettingsDto } from './dto/settings.dto';
import { debug } from 'util';
import { Projections } from '../shared/repository/projections.constants';
import { CredentialsDto } from './dto/credentials.dto';

@Injectable()
export class SettingsService implements ISettingsService {
  public constructor(
    @Inject(InjectionTokens.SettingsModel) private readonly settingsModel: PassportLocalModel<ISettings>,
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
  public buildQuery(clauses: {}, sorter?: {}, projection?: {}): Promise<Array<ISettings>> {
    let query: any;

    query = this.settingsModel.find(clauses).sort(sorter);
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

  public async create(settingsDto: SettingsDto, owner: string): Promise<ISettings> {
    const createdSettings = new this.settingsModel({ space: settingsDto.space, owner });
    return await createdSettings.save();
  }

  public async update(settings: ISettings): Promise<ISettings> {
    this.logger.log(`[SettingsRepository]`, `Updating Setting: ${settings.space}`);
    return this.settingsModel
      .findOneAndUpdate({ space: settings.space }, settings, {
        upsert: true,
        new: true,
        runValidators: true,
      })
      .then((settings: ISettings) => ({ ...settings.toObject() }))
      .catch(() => debug('settings not found'));
  }

  public async updateCredentials(space: Sources, owner: string, settings: ISettings): Promise<ISettings> {
    this.logger.log(`[SettingsRepository]`, `Updating credentials for ${space}`);
    return this.settingsModel
      .findOneAndUpdate({ space, owner }, settings, { upsert: true, new: true, runValidators: true })
      .then((settings: ISettings) => {
        return { ...settings.toObject() };
      })
      .catch(() => debug('settings not found'));
  }

  //                                                                                                      //
  //? Retrieve
  //                                                                                                      //

  public async findAll(): Promise<ISettings[]> {
    return await this.settingsModel.find().exec();
  }

  public async findById(id: string): Promise<ISettings> {
    this.logger.log(`[SettingsRepository]`, `Fetching Setting with id: ${id}`);
    const settings = await this.settingsModel.findById(id);
    return settings ? { ...settings.toObject() } : null;
  }

  public async getSettingsBySpace(space: string): Promise<ISettings | null> {
    this.logger.log(`[SettingsRepository]`, `Fetching Setting with name: ${space}`);
    const settings = await this.settingsModel.findOne({ space });
    return settings ? { ...settings.toObject() } : null;
  }

  // public async getSetting(clauses: {}, projection = Projections.Settings): Promise<ISettings> {
  //   this.logger.log(`[SettingsRepository]`, `Fetching Settings with clauses: ${JSON.stringify(clauses)}`);
  //   const settings = await this.settingsModel.findOne(clauses, projection);
  //   return settings ? { ...settings.toObject() } : null;
  // }

  public async getSettings(clauses: {}, sorter?: {}, projection = Projections.Settings): Promise<Array<ISettings>> {
    this.logger.log(`[SettingsRepository]`, `Fetching Settings with clauses: ${JSON.stringify(clauses)}`);
    const settings = await this.buildQuery(clauses, sorter, projection);
    return settings.map(settings => settings);
  }

  public async search(space: any): Promise<Array<ISettings>> {
    this.logger.log(`[SettingsRepository]`, `Fetching Settings with names that match: ${JSON.stringify(space)}`);
    const settings = await this.settingsModel
      .find({
        space: { $regex: new RegExp(space, 'i') },
      })
      .select(Projections.Settings)
      .sort({ space: 1 });
    return settings.map(settings => ({ ...settings.toObject() }));
  }

  //                                                                                                      //
  //! Delete
  //                                                                                                      //

  async delete(settingsDto: SettingsDto): Promise<string> {
    try {
      await this.settingsModel.findOneAndDelete({ space: settingsDto.space }).exec();
      return `${settingsDto.space} settings has been deleted`;
    } catch (err) {
      debug(err);
      return `${settingsDto.space} space could not be deleted`;
    }
  }
}
