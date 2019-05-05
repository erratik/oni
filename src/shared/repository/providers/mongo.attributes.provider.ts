import { Connection, Document } from 'mongoose';
import { InjectionTokens } from '../../../app.constants';
import AttributeSchema from '../../../attributes/interfaces/attribute.schema';

export const attributeModelMongoDbProvider = [
  {
    provide: InjectionTokens.AttributeModel,
    useFactory: (connection: Connection) => connection.model<Document>('Attributes', AttributeSchema),
    inject: [InjectionTokens.MongoDbConnection],
  },
];
