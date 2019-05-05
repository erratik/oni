import { Connection, Document } from 'mongoose';
import { InjectionTokens } from '../../../app.constants';
import DropSchemaSchema from '../../../drop-schemas/interfaces/drop-schema.schema';

export const dropSchemaModelMongoDbProvider = [
  {
    provide: InjectionTokens.DropSchemaModel,
    useFactory: (connection: Connection) => connection.model<Document>('DropSchema', DropSchemaSchema),
    inject: [InjectionTokens.MongoDbConnection],
  },
];
