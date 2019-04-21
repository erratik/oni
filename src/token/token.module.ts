import { Module, HttpModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { SharedServicesModule } from '../shared/shared-services.module';
import { AuthService } from '../auth/auth.service';
import { LoggerService } from '../shared/services/logger.service';
import { JwtStrategy } from '../auth/passport/jwt.strategy';
import { mongoDatabaseProviders } from '../shared/repository/providers/mongo.database.provider';
import { tokenModelMongoDbProvider } from '../shared/repository/providers/mongo.tokens.provider';
import { userModelMongoDbProvider } from '../shared/repository/providers/mongo.user.provider';
import { UserService } from '../user/user.service';
import { SettingsService } from '../settings/settings.service';
import { settingsModelMongoDbProvider } from '../shared/repository/providers/mongo.settings.provider';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [SharedServicesModule, PassportModule.register({ defaultStrategy: 'jwt' }), HttpModule],
  controllers: [TokenController],
  providers: [
    ...mongoDatabaseProviders,
    ...settingsModelMongoDbProvider,
    ...tokenModelMongoDbProvider,
    ...userModelMongoDbProvider,
    TokenService,
    AuthService,
    UserService,
    SettingsService,
    LoggerService,
    ConfigService,
    TokenService,
    JwtStrategy,
  ],
  exports: [TokenService],
})
export class TokenModule {}
