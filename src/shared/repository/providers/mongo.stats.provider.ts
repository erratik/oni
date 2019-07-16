import { Connection, Document } from 'mongoose';
import { InjectionTokens } from '../../../app.constants';
import StatsSchema from '../../../stats/interfaces/stats.schema';

export const statsModelMongoDbProvider = [
  {
    provide: InjectionTokens.StatsModel,
    useFactory: (connection: Connection) => connection.model<Document>('Stats', StatsSchema),
    inject: [InjectionTokens.MongoDbConnection],
  },
];
