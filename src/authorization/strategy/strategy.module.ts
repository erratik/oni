import { Module } from '@nestjs/common';
import { StrategyController } from './strategy.controller';
import { StrategyService } from './strategy.service';
import { cacheProviders } from '../../shared/cache/cache.provider';
import { RedisCacheService } from '../../shared/cache/redis-cache.service';
import { SharedServicesModule } from '../../shared/shared-services.module';
import { CacheModule } from '../../shared/cache/cache.module';
import { mongoDatabaseProviders } from '../../repository/providers/mongo.database.provider';
import { userModelMongoDbProvider } from '../../repository/providers/mongo.user.provider';

@Module({
  imports: [SharedServicesModule, CacheModule],
  controllers: [StrategyController],
  providers: [...mongoDatabaseProviders, ...userModelMongoDbProvider, cacheProviders, StrategyService, RedisCacheService],
})
export class StrategyModule {}
