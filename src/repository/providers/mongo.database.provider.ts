import { InjectionTokens } from '../../app.constants';
import * as mongoose from 'mongoose';
import { ConfigService } from '../../config/config.service';

const configService: ConfigService = new ConfigService();

export const mongoDatabaseProviders = [
  {
    provide: InjectionTokens.MongoDbConnection,
    useFactory: async () => {
      (mongoose as any).Promise = global.Promise;
      if (configService.isUnitTestMode) {
        return await mongoose.connect(configService.config.mongodbTestUrl!, { useNewUrlParser: true });
      }
      return await mongoose.connect(configService.config.mongodbUrl!, { useNewUrlParser: true });
    },
  },
];
