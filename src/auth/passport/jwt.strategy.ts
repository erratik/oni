import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Injectable, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { JwtPayload } from '../interfaces/auth.interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'ILovePokemon',
    });
  }

  async validate(req: any, payload: any, done: Function) {
    const user = await this.authService.validateUser(req);
    if (!user) {
      return done(new UnauthorizedException(), false);
    }
    return user;
    // done(null, user);
    // return done(HttpStatus.OK, user, { message: 'Logged in Successfully' });
  }
}
