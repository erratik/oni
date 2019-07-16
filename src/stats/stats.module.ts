import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { StatsController } from './stats.controller';
import { SharedServicesModule } from '../shared/shared-services.module';
import { LoggerService } from '../shared/services/logger.service';
import { JwtStrategy } from '../auth/passport/jwt.strategy';
import { mongoDatabaseProviders } from '../shared/repository/providers/mongo.database.provider';
import { ConfigService } from '../config/config.service';
import { statsModelMongoDbProvider } from '../shared/repository/providers/mongo.stats.provider';
import { AuthService } from '../auth/auth.service';
import { SettingsService } from '../settings/settings.service';
import { settingsModelMongoDbProvider } from '../shared/repository/providers/mongo.settings.provider';
import { userModelMongoDbProvider } from '../shared/repository/providers/mongo.user.provider';
import { UserService } from '../user/user.service';
import { StatsService } from '../stats/stats.service';

@Module({
  imports: [SharedServicesModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [StatsController],
  providers: [
    ...mongoDatabaseProviders,
    ...statsModelMongoDbProvider,
    ...settingsModelMongoDbProvider,
    ...userModelMongoDbProvider,
    StatsService,
    LoggerService,
    ConfigService,
    UserService,
    SettingsService,
    JwtStrategy,
    AuthService,
  ],
  exports: [StatsService],
})
export class StatsModule {}
