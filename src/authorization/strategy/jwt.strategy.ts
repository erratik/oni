import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, TokenResponse } from '../../shared/interfaces/jwt-payload.interfaces';
import { LoggerService } from '../../shared/services/logger.service';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService, public logger: LoggerService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secretKey',
    });
  }

  async validate(payload: JwtPayload, tokenResponse: TokenResponse) {
    const user = await this.userService.validateUser(payload, tokenResponse);
    if (!user) {
      this.logger.log('[JwtStrategy]', 'No user provided to validate');
      throw new UnauthorizedException();
    }
    return user;
  }
}
