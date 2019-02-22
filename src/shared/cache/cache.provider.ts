import { InjectionTokens } from './../../app.constants';
import { ConfigService } from './../../config/config.service';
import { RedisCacheService } from './redis-cache.service';

export const cacheProviders = {
  provide: InjectionTokens.CacheService,
  useFactory: (configService: ConfigService) => new RedisCacheService(configService),
  inject: [ConfigService],
};
