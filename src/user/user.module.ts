import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SharedServicesModule } from '../shared/shared-services.module';
import { userModelMongoDbProvider } from '../shared/repository/providers/mongo.user.provider';
import { mongoDatabaseProviders } from '../shared/repository/providers/mongo.database.provider';
import { AuthService } from '../auth/auth.service';
import { LoggerService } from '../shared/services/logger.service';
import { JwtStrategy } from '../auth/passport/jwt.strategy';
import { LocalStrategy } from '../auth/passport/local.strategy';
import { settingsModelMongoDbProvider } from '../shared/repository/providers/mongo.settings.provider';
import { SettingsService } from '../settings/settings.service';

@Module({
  imports: [SharedServicesModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [UserController],
  providers: [
    ...mongoDatabaseProviders,
    ...userModelMongoDbProvider,
    ...settingsModelMongoDbProvider,
    SettingsService,
    UserService,
    AuthService,
    LoggerService,
    UserService,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [UserService, SettingsService],
})
export class UserModule {}
