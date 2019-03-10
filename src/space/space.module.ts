import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';
import { SharedServicesModule } from '../shared/shared-services.module';
import { AuthService } from '../auth/auth.service';
import { LoggerService } from '../shared/services/logger.service';
import { JwtStrategy } from '../auth/passport/jwt.strategy';
import { mongoDatabaseProviders } from '../shared/repository/providers/mongo.database.provider';
import { spaceModelMongoDbProvider } from '../shared/repository/providers/mongo.spaces.provider';
import { userModelMongoDbProvider } from '../shared/repository/providers/mongo.user.provider';
import { UserService } from '../user/user.service';
import { SettingsService } from '../settings/settings.service';
import { settingsModelMongoDbProvider } from '../shared/repository/providers/mongo.settings.provider';

@Module({
  imports: [SharedServicesModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [SpaceController],
  providers: [
    ...mongoDatabaseProviders,
    ...spaceModelMongoDbProvider,
    ...userModelMongoDbProvider,
    ...settingsModelMongoDbProvider,
    SpaceService,
    AuthService,
    UserService,
    SettingsService,
    LoggerService,
    SpaceService,
    JwtStrategy,
  ],
  exports: [SpaceService],
})
export class SpaceModule {}