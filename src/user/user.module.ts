import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SharedServicesModule } from '../shared/shared-services.module';
import { userModelMongoDbProvider } from '../repository/providers/mongo.user.provider';
import { mongoDatabaseProviders } from '../repository/providers/mongo.database.provider';
import { AuthService } from '../auth/auth.service';

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
  controllers: [UserController],
  providers: [...mongoDatabaseProviders, ...userModelMongoDbProvider, UserService, AuthService],
  exports: [UserService],
})
export class UserModule {}
