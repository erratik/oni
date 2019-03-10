import { ISettings } from './settings.schema';
import { SettingsDto } from '../../settings/dto/settings.dto';

export interface ISettingsService {
  findAll(): Promise<ISettings[]>;
  findById(id: string): Promise<ISettings | null>;
  findOne?(options: object): Promise<ISettings | null>;
  create(settingsDto: SettingsDto, owner: string): Promise<ISettings>;
  update(settings: ISettings): Promise<ISettings | null>;
  delete?(settingsDto: SettingsDto): Promise<string>;
}
