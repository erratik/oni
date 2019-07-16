import { Module, HttpModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { DropController } from './drop.controller';
import { SharedServicesModule } from '../shared/shared-services.module';
import { AuthService } from '../auth/auth.service';
import { LoggerService } from '../shared/services/logger.service';
import { JwtStrategy } from '../auth/passport/jwt.strategy';
import { mongoDatabaseProviders } from '../shared/repository/providers/mongo.database.provider';
import { userModelMongoDbProvider } from '../shared/repository/providers/mongo.user.provider';
import { UserService } from '../user/user.service';
import { SettingsService } from '../settings/settings.service';
import { settingsModelMongoDbProvider } from '../shared/repository/providers/mongo.settings.provider';
import { ConfigService } from '../config/config.service';
import { DropService } from './drop.service';
import { SpaceRequestService } from '../space/space-request.service';
import { dropSetModelMongoDbProvider } from '../shared/repository/providers/mongo.drop-set.provider';
import { dropItemModelMongoDbProvider } from '../shared/repository/providers/mongo.drop-items.provider';
import { attributeModelMongoDbProvider } from '../shared/repository/providers/mongo.attributes.provider';
import { AttributeService } from '../attributes/attributes.service';
import { DatasetService } from '../shared/services/dataset.service';
import { dropSchemaModelMongoDbProvider } from '../shared/repository/providers/mongo.drop-schema.provider';
import { DropSchemaService } from '../drop-schemas/drop-schema.service';
import { LocationService } from '../space/services/location.service';
import { StatsService } from '../stats/stats.service';
import { statsModelMongoDbProvider } from '../shared/repository/providers/mongo.stats.provider';

@Module({
  imports: [SharedServicesModule, PassportModule.register({ defaultStrategy: 'jwt' }), HttpModule],
  controllers: [DropController],
  providers: [
    ...mongoDatabaseProviders,
    ...settingsModelMongoDbProvider,
    ...dropSetModelMongoDbProvider,
    ...dropItemModelMongoDbProvider,
    ...userModelMongoDbProvider,
    ...attributeModelMongoDbProvider,
    ...dropSchemaModelMongoDbProvider,
    ...statsModelMongoDbProvider,
    DropService,
    AuthService,
    UserService,
    SettingsService,
    AttributeService,
    StatsService,
    LoggerService,
    ConfigService,
    DropService,
    JwtStrategy,
    SpaceRequestService,
    DropSchemaService,
    DatasetService,
    LocationService,
  ],
  exports: [DropService],
})
export class DropModule {}
