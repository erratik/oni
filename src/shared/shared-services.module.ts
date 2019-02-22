import { Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { ConfigService } from './../config/config.service';
import { cacheProviders } from './cache/cache.provider';
import { AuthenticationService } from './../authentication/authentication.service';
import { CacheModule } from './cache/cache.module';
import { RedisCacheService } from './cache/redis-cache.service';

@Module({
  imports: [
  ],
  providers: [
    ConfigService,
    LoggerService,
    AuthenticationService,
    cacheProviders,
    RedisCacheService,
  ],
  exports: [
    LoggerService,
    AuthenticationService,
  ],
})

export class SharedServicesModule { }
