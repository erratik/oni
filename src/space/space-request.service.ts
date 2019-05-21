import * as superagent from 'superagent';
import * as btoa from 'btoa';
import { Injectable, HttpStatus, Response, Body } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { ISettings } from '../settings/interfaces/settings.schema';
import { TokenService } from '../token/token.service';
import { ConfigService } from '../config/config.service';
import { QueryRequestSources as SpacesV1, DataMethod } from './space.constants';

@Injectable()
export class SpaceRequestService {
  public spacesV1: string[] = [];

  public constructor(public logger: LoggerService, public tokenService: TokenService, private readonly configService: ConfigService) {
    for (const n in SpacesV1) {
      this.spacesV1.push(SpacesV1[n]);
    }
  }

  public composeUrl(url: string, params: any): any {
    let uri = Object.entries(params)
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    return url + '?' + uri;
  }

  public getData(settings: ISettings, options: any): Promise<any> {
    //todo interface for options

    if (DataMethod[settings.space] === 'post') {
      return superagent
        .post(options.url)
        .set({ Authorization: 'Bearer ' + settings.authorization.info.access_token })
        .send(options.body);
    } else {
      return this.spacesV1.some(source => source === settings.space)
        ? superagent.get(this.composeUrl(options.url, { access_token: settings.authorization.info.access_token }))
        : superagent.get(options.url).set({ Authorization: 'Bearer ' + settings.authorization.info.access_token });
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
        return this.getData(settings, { url });
      });
  }

  public async getToken(settings: ISettings, code: string): Promise<any> {
    const config = this.configService.config;
    const options = {
      client_id: settings.credentials.clientId,
      client_secret: settings.credentials.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: `${config.baseUrl}/spaces/callback/${settings.space}`,
      code,
    };

    let request = this.spacesV1.some(source => source !== settings.space)
      ? superagent.post(this.composeUrl(settings.credentials.grantorUrl, options))
      : superagent
          .post(settings.credentials.grantorUrl)
          .field('client_id', settings.credentials.clientId)
          .field('client_secret', settings.credentials.clientSecret)
          .field('grant_type', 'authorization_code')
          .field('redirect_uri', `${config.baseUrl}/spaces/callback/${settings.space}`)
          .field('code', code);

    return request
      .then(async result => {
        const token = await this.tokenService.register({ ...result.body, owner: settings.owner, space: settings.space }, settings).then(token => token);
        return token;
      })
      .catch(({ response }) => ({ error: response.error, body: response.body }));
  }

  public async fetchHandler(settings: ISettings, query: any, @Response() res, @Body() body?) {
    if (!settings && !!res) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `No ${settings.space} settings for found for ${settings.owner}` });
    }

    const token = settings.authorization.info;
    if (!token && !!res) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `No ${settings.space} token for ${settings.owner}` });
    }

    const url = settings.baseUrl + query.endpoint;
    const isTokenExpired = new Date().valueOf() >= token.updatedAt.valueOf() + token.expires_in * 1000;

    if (isTokenExpired && !!token.refresh_token) {
      return await this.refreshToken(settings, url).catch(err => (!res ? null : res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err)));
    } else {
      const receivedData = this.getData(settings, { url, body });
      return !query.consumed
        ? await receivedData
            .then(({ body }) => (!res ? null : res.status(HttpStatus.OK).json(body)))
            .catch(err => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err))
        : await receivedData.then(({ body }) => body);
    }
  }
}
