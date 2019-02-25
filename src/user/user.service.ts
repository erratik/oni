import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from '../shared/services/logger.service';
import { ConfigService } from '../config/config.service';
import { JwtPayload, TokenResponse } from '../shared/interfaces/jwt-payload.interfaces';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly jwtService: JwtService, private logger: LoggerService, private configService: ConfigService, private userRepo: UserRepository) {}

  async createToken(user: JwtPayload = { email: 'dev@erratik.ca' }): Promise<TokenResponse> {
    const accessToken: string = this.jwtService.sign(user);
    this.logger.log('[UserService]', `Created accessToken for ${user.email}`);
    return {
      accessToken,
      expiresIn: this.configService.config.jwtTokenDuration,
    };
  }

  async validateUser(user: JwtPayload, tokenResponse: TokenResponse): Promise<any> {
    // tokenResponse.notBefore = Date.now() + tokenResponse.expiresIn;
    this.logger.log('[UserService]', `.... created JWT signed for ${user.email}, expires ${Date.now() + tokenResponse.expiresIn}`);

    // todo: if user exists, check mongo, save tokens
    const retrievedUser = await this.userRepo.getUser({ email: user.email });

    return retrievedUser;
  }
}
