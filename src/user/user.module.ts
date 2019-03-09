import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SharedServicesModule } from '../shared/shared-services.module';
import { userModelMongoDbProvider } from '../repository/providers/mongo.user.provider';
import { mongoDatabaseProviders } from '../repository/providers/mongo.database.provider';
import { AuthService } from '../auth/auth.service';
import { LoggerService } from '../shared/services/logger.service';
import { JwtStrategy } from '../auth/passport/jwt.strategy';
import { LocalStrategy } from '../auth/passport/local.strategy';

@Module({
  imports: [SharedServicesModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [UserController],
  providers: [
    ...mongoDatabaseProviders,
    ...userModelMongoDbProvider,
    UserService,
    AuthService,
    LoggerService,
    UserService,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [UserService],
})
export class UserModule {}
