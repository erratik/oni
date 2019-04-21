import { Connection, Document } from 'mongoose';
import { InjectionTokens } from '../../../app.constants';
import dropSchema from '../../../drop/interfaces/drop-set.schema';
import DropSetSchema from '../../../drop/interfaces/drop-set.schema';

export const dropSetModelMongoDbProvider = [
  {
    provide: InjectionTokens.DropSetModel,
    useFactory: (connection: Connection) => connection.model<Document>('DropSets', DropSetSchema),
    inject: [InjectionTokens.MongoDbConnection],
  },
];
