import { Connection } from 'mongoose';
import { InjectionTokens } from '../../app.constants';
import userSchema from '../../repository/schemas/user.schema';
import { UserModel } from '../../user/interfaces/user.models';

export const userModelMongoDbProvider = [
  {
    provide: InjectionTokens.UserModel,
    useFactory: (connection: Connection) => connection.model<UserModel>('Users', userSchema),
    inject: [InjectionTokens.MongoDbConnection],
  },
];
