import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { DropSchemaController } from './drop-schema.controller';
import { SharedServicesModule } from '../shared/shared-services.module';
import { LoggerService } from '../shared/services/logger.service';
import { JwtStrategy } from '../auth/passport/jwt.strategy';
import { mongoDatabaseProviders } from '../shared/repository/providers/mongo.database.provider';
import { ConfigService } from '../config/config.service';
import { dropSchemaModelMongoDbProvider } from '../shared/repository/providers/mongo.drop-schema.provider';
import { DropSchemaService } from './drop-schema.service';
import { AuthService } from '../auth/auth.service';
import { SettingsService } from '../settings/settings.service';
import { settingsModelMongoDbProvider } from '../shared/repository/providers/mongo.settings.provider';
import { userModelMongoDbProvider } from '../shared/repository/providers/mongo.user.provider';
import { UserService } from '../user/user.service';
import { AttributeService } from '../attributes/attributes.service';
import { attributeModelMongoDbProvider } from '../shared/repository/providers/mongo.attributes.provider';

@Module({
  imports: [SharedServicesModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [DropSchemaController],
  providers: [
    ...mongoDatabaseProviders,
    ...dropSchemaModelMongoDbProvider,
    ...settingsModelMongoDbProvider,
    ...userModelMongoDbProvider,
    ...attributeModelMongoDbProvider,
    DropSchemaService,
    AttributeService,
    LoggerService,
    ConfigService,
    UserService,
    SettingsService,
    JwtStrategy,
    AuthService,
  ],
  exports: [DropSchemaService],
})
export class DropSchemaModule {}
