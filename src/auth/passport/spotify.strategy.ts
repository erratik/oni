import { ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy as SpotifyStrategy } from 'passport-spotify';

@Injectable()
export class SpotifyPassportStrategy extends PassportStrategy(SpotifyStrategy) {
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
