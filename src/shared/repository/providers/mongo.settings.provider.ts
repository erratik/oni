import { Connection, Document } from 'mongoose';
import { InjectionTokens } from '../../../app.constants';
import settingsSchema from '../../../settings/interfaces/settings.schema';

export const settingsModelMongoDbProvider = [
  {
    provide: InjectionTokens.SettingsModel,
    useFactory: (connection: Connection) => connection.model<Document>('Settings', settingsSchema),
    inject: [InjectionTokens.MongoDbConnection],
  },
];
