import { ConfigModule } from './config/config.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { StatusModule } from './status/status.module';
import { VersionModule } from './version/version.module';
import { StrategyModule } from './authorization/strategy/strategy.module';
import { UserModule } from './user/user.module';
import { LoggerService } from './shared/services/logger.service';
import { UserService } from './user/user.service';
import { ConfigService } from './config/config.service';
import { UserRepository } from './repository/user.repository';
import { mongoDatabaseProviders } from './repository/providers/mongo.database.provider';
import { userModelMongoDbProvider } from './repository/providers/mongo.user.provider';

@Module({
  imports: [StatusModule, VersionModule, ConfigModule, StrategyModule, UserModule],
  providers: [...mongoDatabaseProviders, ...userModelMongoDbProvider, UserService, LoggerService, ConfigService, UserRepository],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
