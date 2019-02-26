import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from '../shared/services/logger.service';
import { ConfigService } from '../config/config.service';
import { JwtPayload, TokenResponse } from '../shared/interfaces/jwt-payload.interfaces';
import { UserRepository } from '../repository/user.repository';
import { UserModel, AuthorizationDBModel } from '../repository/document.interfaces';
import * as moment from 'moment';
import { Attributes, Sources } from '../app.constants';

@Injectable()
export class UserService {
  constructor(private readonly jwtService: JwtService, private logger: LoggerService, private configService: ConfigService, private userRepo: UserRepository) {}

  async createToken(user: JwtPayload = { email: 'dev@erratik.ca' }): Promise<TokenResponse> {
    this.logger.log('[UserService]', `Created accessToken for ${user.email}`);
    const accessToken: string = this.jwtService.sign(user);
    return { accessToken };
  }

  async validateUser(user: JwtPayload, tokenResponse: TokenResponse, scope: Attributes | Sources = Attributes.AppName): Promise<UserModel> {
    this.logger.log('[UserService]', `created JWT signed for ${user.email}`);

    const retrievedUser = await this.userRepo.getUser({ email: user.email });

    tokenResponse.scope = scope;
    tokenResponse.expiry = moment()
      .add(this.configService.config.jwtTokenDuration, 'seconds')
      .toDate();

    // todo: build a helper for this, don't wanna repeat this ever!
    const authToUpdate = !!retrievedUser.authorization ? retrievedUser.authorization.find(e => e.scope === Attributes.AppName) : false;
    if (authToUpdate) {
      retrievedUser.authorization.map(auth => {
        if (auth.scope === Attributes.AppName) {
          auth.accessToken = tokenResponse.accessToken;
          auth.expiry = tokenResponse.expiry;
        }
        return auth;
      });
    } else if (!authToUpdate && !!retrievedUser.authorization) {
      retrievedUser.authorization.push(tokenResponse as AuthorizationDBModel);
    } else {
      retrievedUser.authorization = [tokenResponse as AuthorizationDBModel];
    }

    const updatedUser: UserModel = await this.userRepo.updateUser(retrievedUser);
    return updatedUser;
  }
}
