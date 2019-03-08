import { ConfigModule } from './config/config.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { StatusModule } from './status/status.module';
import { VersionModule } from './version/version.module';
import { UserModule } from './user/user.module';
import { LoggerService } from './shared/services/logger.service';
import { UserService } from './user/user.service';
import { ConfigService } from './config/config.service';
import { mongoDatabaseProviders } from './repository/providers/mongo.database.provider';
import { userModelMongoDbProvider } from './repository/providers/mongo.user.provider';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [StatusModule, VersionModule, ConfigModule, UserModule, AuthModule],
  providers: [
    ...mongoDatabaseProviders,
    ...userModelMongoDbProvider,
    UserService,
    LoggerService,
    ConfigService,
    AuthService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
