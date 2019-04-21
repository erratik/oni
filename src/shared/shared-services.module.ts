import { Module, HttpModule } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { ConfigService } from './../config/config.service';
import { cacheProviders } from './cache/cache.provider';
import { RedisCacheService } from './cache/redis-cache.service';
import { SpaceRequestService } from '../space/space-request.service';
import { TokenService } from '../token/token.service';
import { tokenModelMongoDbProvider } from './repository/providers/mongo.tokens.provider';
import { SettingsService } from '../settings/settings.service';
import { mongoDatabaseProviders } from './repository/providers/mongo.database.provider';
import { settingsModelMongoDbProvider } from './repository/providers/mongo.settings.provider';

@Module({
  imports: [HttpModule],
  providers: [
    ...mongoDatabaseProviders,
    ...tokenModelMongoDbProvider,
    ...settingsModelMongoDbProvider,
    TokenService,
    ConfigService,
    LoggerService,
    SpaceRequestService,
    SettingsService,
    cacheProviders,
    RedisCacheService,
  ],
  exports: [ConfigService, LoggerService, SpaceRequestService, TokenService],
})
export class SharedServicesModule {}
