import { ConfigService } from './../../config/config.service';
import { RedisCacheService } from './redis-cache.service';
import { InjectionTokens } from '../../app.constants';

export const cacheProviders = {
  provide: InjectionTokens.CacheService,
  useFactory: (configService: ConfigService) => new RedisCacheService(configService),
  inject: [ConfigService],
};
