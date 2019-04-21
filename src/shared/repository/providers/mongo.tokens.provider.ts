import { Connection, Document } from 'mongoose';
import { InjectionTokens } from '../../../app.constants';
import TokenSchema from '../../../token/interfaces/tokens.schema';

export const tokenModelMongoDbProvider = [
  {
    provide: InjectionTokens.TokenModel,
    useFactory: (connection: Connection) => connection.model<Document>('Tokens', TokenSchema),
    inject: [InjectionTokens.MongoDbConnection],
  },
];
