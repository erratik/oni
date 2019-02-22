import { Module } from '@nestjs/common';
import { SharedServicesModule } from './../shared-services.module';
import { ConfigModule } from './../../config/config.module';
import { RedisCacheService } from './redis-cache.service';
import { ConfigService } from './../../config/config.service';
import { cacheProviders } from './cache.provider';

@Module({
  imports: [
    ConfigModule,
    SharedServicesModule,
  ],
  providers: [
    cacheProviders,
    ConfigService,
    RedisCacheService,
  ],
  exports: [
    cacheProviders,
    RedisCacheService,
  ],
})
export class CacheModule { }
