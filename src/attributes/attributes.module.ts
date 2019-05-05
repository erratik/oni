import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AttributeController } from './attributes.controller';
import { SharedServicesModule } from '../shared/shared-services.module';
import { LoggerService } from '../shared/services/logger.service';
import { JwtStrategy } from '../auth/passport/jwt.strategy';
import { mongoDatabaseProviders } from '../shared/repository/providers/mongo.database.provider';
import { ConfigService } from '../config/config.service';
import { attributeModelMongoDbProvider } from '../shared/repository/providers/mongo.attributes.provider';
import { AttributeService } from './attributes.service';
import { AuthService } from '../auth/auth.service';
import { SettingsService } from '../settings/settings.service';
import { settingsModelMongoDbProvider } from '../shared/repository/providers/mongo.settings.provider';
import { userModelMongoDbProvider } from '../shared/repository/providers/mongo.user.provider';
import { UserService } from '../user/user.service';

@Module({
  imports: [SharedServicesModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AttributeController],
  providers: [
    ...mongoDatabaseProviders,
    ...attributeModelMongoDbProvider,
    ...settingsModelMongoDbProvider,
    ...userModelMongoDbProvider,
    AttributeService,
    LoggerService,
    ConfigService,
    UserService,
    SettingsService,
    JwtStrategy,
    AuthService,
  ],
  exports: [AttributeService],
})
export class AttributeModule {}
