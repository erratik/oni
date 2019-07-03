import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { ISettings } from '../../settings/interfaces/settings.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService, private readonly settingsService: SettingsService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(req: any, done: Function) {
    const user = await this.authService.validateUser(req).then(async owner => {
      return await this.settingsService.getSettings({ owner: owner.username }).then(settings => {
        owner.settings = settings;
        return owner;
      });
    });

    if (!user) {
      return done(new UnauthorizedException(), false);
    }

    return user;
  }
}
