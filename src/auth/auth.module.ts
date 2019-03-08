import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SharedServicesModule } from '../shared/shared-services.module';
import { LoggerService } from '../shared/services/logger.service';
import { mongoDatabaseProviders } from '../repository/providers/mongo.database.provider';
import { userModelMongoDbProvider } from '../repository/providers/mongo.user.provider';
import { UserService } from '../user/user.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SharedServicesModule,
    PassportModule.register({ defaultStrategy: 'local' }),
    JwtModule.register({
      secretOrPrivateKey: process.env.SESSION_SECRET,
      signOptions: {
        expiresIn: 3600,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...mongoDatabaseProviders,
    ...userModelMongoDbProvider,
    AuthService,
    LoggerService,
    UserService,
    // JwtStrategy,
    // LocalStrategy,
  ],
  exports: [
    // ...mongoDatabaseProviders,
    // ...userModelMongoDbProvider,
    // AuthService,
    // JwtStrategy,
    // LocalStrategy,
  ],
})
export class AuthModule {}
