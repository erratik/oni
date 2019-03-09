import { Connection } from 'mongoose';
import { InjectionTokens } from '../../../app.constants';
import spaceSchema from '../../../space/interfaces/space.schema';
import { SpaceModel } from '../../../space/interfaces/space.models';

export const spaceModelMongoDbProvider = [
  {
    provide: InjectionTokens.SpaceModel,
    useFactory: (connection: Connection) => connection.model<SpaceModel>('Spaces', spaceSchema),
    inject: [InjectionTokens.MongoDbConnection],
  },
];
