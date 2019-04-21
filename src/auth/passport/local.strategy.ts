import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { PassportLocalModel } from 'passport-local-mongoose';

import { InjectionTokens } from '../../app.constants';
import { IUser } from '../../user/interfaces/user.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(InjectionTokens.UserModel) userModel: PassportLocalModel<IUser>) {
    super(
      {
        usernameField: 'username',
        passwordField: 'password',
      },
      userModel.authenticate()
    );
  }
}
