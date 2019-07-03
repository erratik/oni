import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SharedServicesModule } from '../shared/shared-services.module';
import { LoggerService } from '../shared/services/logger.service';
import { mongoDatabaseProviders } from '../shared/repository/providers/mongo.database.provider';
import { userModelMongoDbProvider } from '../shared/repository/providers/mongo.user.provider';
import { UserService } from '../user/user.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './passport/local.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { settingsModelMongoDbProvider } from '../shared/repository/providers/mongo.settings.provider';
import { SettingsService } from '../settings/settings.service';

@Module({
  imports: [
    SharedServicesModule,
    JwtModule.register({
      secretOrPrivateKey: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: 3600,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...mongoDatabaseProviders,
    ...userModelMongoDbProvider,
    ...settingsModelMongoDbProvider,
    SettingsService,
    AuthService,
    LoggerService,
    UserService,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [
    // ...mongoDatabaseProviders,
    // ...userModelMongoDbProvider,
    // AuthService,
    // JwtStrategy,
    // LocalStrategy,
  ],
})
export class AuthModule {}
