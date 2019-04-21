import { Injectable, HttpService, HttpStatus, Query, Response } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { ISettings } from '../settings/interfaces/settings.schema';
import { TokenService } from '../token/token.service';
import superagent = require('superagent');
import { IToken } from '../auth/interfaces/auth.interfaces';
import * as btoa from 'btoa';
import { ConfigService } from '../config/config.service';
import { QueryRequestSources } from './space.constant';
@Injectable()
export class SpaceRequestService {
  public spaceMap: string[] = [];

  public constructor(
    private http: HttpService,
    public logger: LoggerService,
    public tokenService: TokenService,
    private readonly configService: ConfigService
  ) {
    for (const n in QueryRequestSources) {
      this.spaceMap.push(QueryRequestSources[n]);
    }
  }

  public refreshToken(settings: ISettings, url: string): any {
    return superagent
      .post(
        this.composeUrl(settings.credentials.grantorUrl, {
          grant_type: 'refresh_token',
          refresh_token: settings.authorization.info.refresh_token,
        })
      )
      .set({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(settings.credentials.clientId + ':' + settings.credentials.clientSecret)}`,
      })
      .then(async result => {
        this.tokenService.register({ ...result.body, owner: settings.owner, space: settings.space }, settings);
        settings.authorization.info.access_token = result.body.access_token;
        return this.getData(settings, url);
      });
  }

  public async getToken(settings: ISettings, options: any): Promise<any> {
    const config = this.configService.config;
    let request = this.spaceMap.some(source => source !== settings.space)
      ? superagent.post(this.composeUrl(settings.credentials.grantorUrl, options))
      : superagent
          .post(settings.credentials.grantorUrl)
          .field('client_id', settings.credentials.clientId)
          .field('client_secret', settings.credentials.clientSecret)
          .field('grant_type', 'authorization_code')
          .field('redirect_uri', `${config.baseUrl}/spaces/callback/${settings.space}`)
          .field('code', options.code);

    return request.then(async result => {
      const token = await this.tokenService
        .register({ ...result.body, owner: settings.owner, space: settings.space, expires_in: config.cacheDuration }, settings)
        .then(token => token);
      debugger;
      return token;
    });
  }

  public getData(settings: ISettings, url: string): Promise<any> {
    // return settings.authorization.info.token_type === 'Bearer'
    return this.spaceMap.some(source => source !== settings.space)
      ? superagent.get(url).set({ Authorization: 'Bearer ' + settings.authorization.info.access_token })
      : superagent.get(this.composeUrl(url, { access_token: settings.authorization.info.access_token }));
  }

  public composeUrl(url: string, params: any): any {
    let uri = Object.entries(params)
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    return url + '?' + uri;
  }
}
