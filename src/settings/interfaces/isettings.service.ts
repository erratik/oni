import { ISettings } from './settings.schema';
import { SettingsDto } from '../../settings/dto/settings.dto';
import { Sources } from '../../app.constants';

export interface ISettingsService {
  findAll(): Promise<ISettings[]>;
  findById(id: string): Promise<ISettings | null>;
  findOne?(options: object): Promise<ISettings | null>;
  create(settingsDto: SettingsDto, owner: string): Promise<ISettings>;
  update(owner: string, space: Sources, settings: ISettings): Promise<ISettings | null>;
  delete?(owner: string, space: string): Promise<string>;
}
