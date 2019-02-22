import { cacheProviders } from './../shared/cache/cache.provider';
import { Module } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { AuthorizationMiddleware } from './authorization.middleware';
import { ConfigService } from '../config/config.service';
import { LoggerService } from './../shared/services/logger.service';
import { SharedServicesModule } from './../shared/shared-services.module';
import { CacheModule } from './../shared/cache/cache.module';

@Module({
  imports: [
    SharedServicesModule,
    CacheModule,
  ],
  providers: [
    AuthorizationService,
    ConfigService,
    AuthorizationMiddleware,
    cacheProviders,
    LoggerService,
  ],
  exports: [
    AuthorizationService,
    AuthorizationMiddleware,
  ],
})

export class AuthorizationModule {}
