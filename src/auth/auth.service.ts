import * as jwt from 'jsonwebtoken';
import { Inject, Injectable } from '@nestjs/common';
import { PassportLocalModel } from 'mongoose';

import { debug } from 'console';
import { RegistrationStatus, JwtPayload } from './interfaces/auth.interfaces';
import { InjectionTokens } from '../app.constants';
import { IUser } from '../repository/schemas/user.schema';
import { CreateUserDto } from '../user/dto/createUser.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(InjectionTokens.UserModel) private userModel: PassportLocalModel<IUser>,
    private userService: UserService // readonly userService: UsersService
  ) {}

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
        debug(err);
        status = { success: false, message: err };
      }
    });
    return status;
  }

  public createToken(user) {
    console.log('get the expiration');
    const expiresIn = 3600;
    console.log('sign the token');
    console.log(user);

    const token = jwt.sign(
      { id: user.id, email: user.username, firstname: user.firstName, lastname: user.lastName },
      'ILovePokemon',
      { expiresIn }
    );
    console.log('return the token');
    console.log(token);
    return {
      expiresIn,
      token,
    };
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    return await this.userService.findById(payload.id);
  }

  // async validateUser(user: JwtPayload, tokenResponse?: IToken, scope: Attributes | Sources = Attributes.AppName): Promise<IUser> {
  //   this.logger.log('[UserService]', `created JWT signed for ${user.email}`);

  //   const retrievedUser = await this.userService.getUser({ email: user.email });

  //   tokenResponse.scope = scope;
  //   tokenResponse.expiry = moment()
  //     .add(this.configService.config.jwtTokenDuration, 'seconds')
  //     .toDate();

  //   // todo: build a helper for this, don't wanna repeat this ever!
  //   const authToUpdate = !!retrievedUser.authorization ? retrievedUser.authorization.find(e => e.scope === Attributes.AppName) : false;
  //   if (authToUpdate) {
  //     retrievedUser.authorization.map(auth => {
  //       if (auth.scope === Attributes.AppName) {
  //         auth.token = tokenResponse.token;
  //         auth.expiry = tokenResponse.expiry;
  //       }
  //       return auth;
  //     });
  //   } else if (!authToUpdate && !!retrievedUser.authorization) {
  //     retrievedUser.authorization.push(tokenResponse as AuthorizationDBModel);
  //   } else {
  //     retrievedUser.authorization = [tokenResponse as AuthorizationDBModel];
  //   }

  //   const updatedUser: IUser = await this.userService.updateUser(retrievedUser);
  //   return updatedUser;
  // }
}
