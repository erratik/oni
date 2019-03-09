import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportLocalModel } from 'mongoose';

import { InjectionTokens } from '../../app.constants';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from '../../user/interfaces/user.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(InjectionTokens.UserModel) private readonly userModel: PassportLocalModel<IUser>,
    private readonly authService: AuthService
  ) {
    super(
      {
        usernameField: 'username',
        passwordField: 'password',
      },
      userModel.authenticate()
    );
  }
}
