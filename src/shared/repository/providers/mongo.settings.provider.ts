import { Connection } from 'mongoose';
import { InjectionTokens } from '../../../app.constants';
import settingsSchema from '../../../settings/interfaces/settings.schema';
import { SettingsModel } from '../../../settings/interfaces/settings.models';

export const settingsModelMongoDbProvider = [
  {
    provide: InjectionTokens.SettingsModel,
    useFactory: (connection: Connection) => connection.model<SettingsModel>('Settings', settingsSchema),
    inject: [InjectionTokens.MongoDbConnection],
  },
];
