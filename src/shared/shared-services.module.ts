import { Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { ConfigService } from './../config/config.service';
import { cacheProviders } from './cache/cache.provider';
import { RedisCacheService } from './cache/redis-cache.service';

@Module({
  imports: [],
  providers: [ConfigService, LoggerService, cacheProviders, RedisCacheService],
  exports: [ConfigService, LoggerService],
})
export class SharedServicesModule {}
