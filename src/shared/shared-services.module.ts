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
import { userModelMongoDbProvider } from './repository/providers/mongo.user.provider';
import { DatasetService } from './services/dataset.service';
import { StatsService } from '../stats/stats.service';
import { statsModelMongoDbProvider } from './repository/providers/mongo.stats.provider';

@Module({
  imports: [HttpModule],
  providers: [
    ...mongoDatabaseProviders,
    ...tokenModelMongoDbProvider,
    ...settingsModelMongoDbProvider,
    ...userModelMongoDbProvider,
    ...statsModelMongoDbProvider,
    TokenService,
    ConfigService,
    LoggerService,
    SpaceRequestService,
    StatsService,
    SettingsService,
    cacheProviders,
    RedisCacheService,
    DatasetService,
  ],
  exports: [ConfigService, LoggerService, SpaceRequestService, TokenService, StatsService, DatasetService],
})
export class SharedServicesModule {}
