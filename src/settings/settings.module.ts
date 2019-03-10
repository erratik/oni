import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SharedServicesModule } from '../shared/shared-services.module';
import { AuthService } from '../auth/auth.service';
import { LoggerService } from '../shared/services/logger.service';
import { JwtStrategy } from '../auth/passport/jwt.strategy';
import { mongoDatabaseProviders } from '../shared/repository/providers/mongo.database.provider';
import { settingsModelMongoDbProvider } from '../shared/repository/providers/mongo.settings.provider';
import { userModelMongoDbProvider } from '../shared/repository/providers/mongo.user.provider';
import { UserService } from '../user/user.service';

@Module({
  imports: [SharedServicesModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [SettingsController],
  providers: [
    ...mongoDatabaseProviders,
    ...settingsModelMongoDbProvider,
    ...userModelMongoDbProvider,
    SettingsService,
    AuthService,
    UserService,
    LoggerService,
    SettingsService,
    JwtStrategy,
  ],
  exports: [SettingsService],
})
export class SettingsModule {}
