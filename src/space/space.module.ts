import { Module, HttpModule } from '@nestjs/common';
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
import { ConfigService } from '../config/config.service';
import { tokenModelMongoDbProvider } from '../shared/repository/providers/mongo.tokens.provider';
import { TokenService } from '../token/token.service';
import { SpaceRequestService } from './space-request.service';

@Module({
  imports: [SharedServicesModule, PassportModule.register({ defaultStrategy: 'jwt' }), HttpModule],
  controllers: [SpaceController],
  providers: [
    ...mongoDatabaseProviders,
    ...settingsModelMongoDbProvider,
    ...spaceModelMongoDbProvider,
    ...tokenModelMongoDbProvider,
    ...userModelMongoDbProvider,
    SpaceService,
    AuthService,
    UserService,
    SettingsService,
    TokenService,
    LoggerService,
    ConfigService,
    SpaceService,
    SpaceRequestService,
    JwtStrategy,
  ],
  exports: [SpaceService],
})
export class SpaceModule {}
