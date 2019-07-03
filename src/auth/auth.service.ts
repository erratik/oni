import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import { Inject, Injectable } from '@nestjs/common';
import { PassportLocalModel } from 'passport-local-mongoose';

import { RegistrationStatus, UserPayload } from './interfaces/auth.interfaces';
import { InjectionTokens, Attributes } from '../app.constants';
import { IUser } from '../user/interfaces/user.schema';
import { CreateUserDto } from '../user/dto/createUser.dto';
import { UserService } from '../user/user.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(InjectionTokens.UserModel) private userModel: PassportLocalModel<IUser>,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  public async validateUser(payload: UserPayload): Promise<any> {
    return await this.userService.getUser({ email: payload.email });
  }

  public async register(user: CreateUserDto): Promise<RegistrationStatus> {
    const userFields = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
    let status: RegistrationStatus = {
      success: true,
      message: `New user registered: ${userFields.firstName} ${userFields.lastName}, as ${userFields.username}`,
    };
    await this.userModel.register(new this.userModel(userFields), user.password, err => {
      if (err) {
        console.error(err);
        status = { success: false, message: err };
      }
    });
    return status;
  }

  public async createToken(user: IUser) {
    console.log('get the expiration');
    const expiresIn = this.configService.config.jwtTokenDuration;

    console.log('sign the token');
    const token = jwt.sign({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }, process.env.JWT_SECRET, { expiresIn });

    const expiry = moment()
      .add(expiresIn, 'seconds')
      .toDate();

    const datawhoreToken = { token, expiry, scope: Attributes.AppName };

    const authToUpdate = !!user.authorization ? user.authorization.find(e => e.scope === Attributes.AppName) : false;
    if (authToUpdate) {
      user.authorization.map(auth => {
        if (auth.scope === Attributes.AppName) {
          auth.token = token;
          auth.expiry = expiry;
        }
        return auth;
      });
    } else if (!authToUpdate && !!user.authorization) {
      user.authorization.push(datawhoreToken);
    } else {
      user.authorization = [datawhoreToken];
    }

    return await this.userService.update(user);
  }
}
