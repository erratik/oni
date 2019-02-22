import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { ConfigService } from './../config/config.service';
import { StatusService } from './status.service';
import { RedisStatusService } from './redis.status.service';
import { LoggerService } from './../shared/services/logger.service';
import { cacheProviders } from './../shared/cache/cache.provider';

@Module({
  controllers: [StatusController],
  providers: [
    StatusService,
    ConfigService,
    RedisStatusService,
    LoggerService,
    cacheProviders,

  ],
})
export class StatusModule {}
