import { ConfigModule } from './config/config.module';
import { MiddlewareConsumer, Module, NestModule, HttpService } from '@nestjs/common';
import { StatusModule } from './status/status.module';
import { VersionModule } from './version/version.module';
import { UserModule } from './user/user.module';
import { LoggerService } from './shared/services/logger.service';
import { UserService } from './user/user.service';
import { ConfigService } from './config/config.service';
import { mongoDatabaseProviders } from './shared/repository/providers/mongo.database.provider';
import { userModelMongoDbProvider } from './shared/repository/providers/mongo.user.provider';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { UserController } from './user/user.controller';
import { userValidatorMiddleware } from './shared/middlewares/user-validator.middleware';
import { tokenValidatorMiddleware } from './shared/middlewares/token-validator.middleware';
import { SpaceController } from './space/space.controller';
import { SpaceModule } from './space/space.module';
import { entityValidatorMiddleware } from './shared/middlewares/entity-validator.middleware';
import { SettingsModule } from './settings/settings.module';
import { SettingsController } from './settings/settings.controller';
import { TokenModule } from './token/token.module';
import { DropModule } from './drop/drop.module';

@Module({
  imports: [StatusModule, VersionModule, ConfigModule, UserModule, AuthModule, SettingsModule, SpaceModule, DropModule],
  providers: [...mongoDatabaseProviders, ...userModelMongoDbProvider, UserService, LoggerService, ConfigService, AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(userValidatorMiddleware).forRoutes(AuthController);
    consumer.apply(tokenValidatorMiddleware).forRoutes(UserController, TokenModule);
    consumer.apply(entityValidatorMiddleware).forRoutes(SpaceController, SettingsController);
  }
}
