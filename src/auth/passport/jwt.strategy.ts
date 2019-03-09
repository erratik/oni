import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'ILovePokemon',
    });
  }

  async validate(req: any, done: Function) {
    const user = await this.authService.validateUser(req);
    if (!user) {
      return done(new UnauthorizedException(), false);
    }
    return user;
  }
}
