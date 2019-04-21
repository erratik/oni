import { Connection, Document } from 'mongoose';
import { InjectionTokens } from '../../../app.constants';
import DropItemSchema from '../../../drop/interfaces/drop-item.schema';

export const dropItemModelMongoDbProvider = [
  {
    provide: InjectionTokens.DropItemModel,
    useFactory: (connection: Connection) => connection.model<Document>('DropItems', DropItemSchema),
    inject: [InjectionTokens.MongoDbConnection],
  },
];
