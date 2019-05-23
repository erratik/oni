import * as superagent from 'superagent';
import * as btoa from 'btoa';
import { Injectable, HttpStatus, Response, Body } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { ISettings } from '../settings/interfaces/settings.schema';
import { TokenService } from '../token/token.service';
import { ConfigService } from '../config/config.service';
import { QueryRequestSources as SpacesV1, DataMethod } from './space.constants';
import { Sources } from '../app.constants';
import { composeUrl } from '../shared/helpers/request.helpers';
import { DropType } from '../drop/drop.constants';

@Injectable()
export class SpaceRequestService {
  public spacesV1: string[] = [];

  public constructor(public logger: LoggerService, public tokenService: TokenService, private readonly configService: ConfigService) {
    for (const n in SpacesV1) {
      this.spacesV1.push(SpacesV1[n]);
    }
  }

  public getData(settings: ISettings, options: any): Promise<any> {
    // todo interface for options
    //! this is too broad for auth requests and for data fetching :o
    const access_token = settings.authorization.info.access_token;
    const querifiedUrl = composeUrl(options.url, { access_token }).replace(/(^.*?\?.*?)(\?)/gm, '$1&');

    const method = options.suffix || false;
    const dataMethod = !['post', 'get'].includes(method) ? DataMethod[settings.space + '_' + method] : !method ? DataMethod[settings.space] : method;

    if (dataMethod === 'post') {
      return superagent
        .post(options.url)
        .set({ Authorization: 'Bearer ' + access_token })
        .send(options.body || {});
    } else if (settings.space === Sources.GoogleApi && options.suffix === DropType.GPS) {
      return superagent.get(querifiedUrl);
    } else {
      return this.spacesV1.some(source => source !== settings.space)
        ? superagent.get(options.url).set({ Authorization: 'Bearer ' + access_token })
        : superagent.get(querifiedUrl);
    }
  }

  public async fetchHandler(settings: ISettings, query: any, @Response() res, @Body() body = null) {
    const suffix = query.type || DropType.Default;
    const url = query.endpoint && query.endpoint.includes('https://') ? query.endpoint : settings.baseUrl + (query.endpoint || '');

    if (this.hasValidToken(settings, url, res)) {
      const receivedData = this.getData(settings, { url, body, suffix });

      return !query.consumed
        ? await receivedData
            .then(({ body }) => (!res ? null : res.status(HttpStatus.OK).json(body)))
            .catch(err => (!res ? null : res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err)))
        : await receivedData.then(({ body }) => body).catch(err => err);
    }
  }

  private async hasValidToken(settings: ISettings, url: string, @Response() res): Promise<boolean> {
    if (!settings) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `No ${settings.space} settings for found for ${settings.owner}` });
    }
    let token = settings.authorization.info;
    if (!token) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `No ${settings.space} token for ${settings.owner}` });
    }
    const isTokenExpired = Date.now() >= token.updatedAt.valueOf() + token.expires_in * 1000 && !!token.refresh_token;
    if (isTokenExpired) {
      token = await this.refreshToken(settings, url).catch(err => (!res ? null : res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err)));
    }
    return true;
  }

  public refreshToken(settings: ISettings, url: string): any {
    const itoken = settings.authorization.info;
    return superagent
      .post(
        composeUrl(settings.credentials.grantorUrl, {
          grant_type: 'refresh_token',
          refresh_token: itoken.refresh_token,
        })
      )
      .set({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(settings.credentials.clientId + ':' + settings.credentials.clientSecret)}`,
      })
      .then(async result => {
        this.tokenService.register({ ...result.body, owner: settings.owner, space: settings.space }, settings);
        itoken.access_token = result.body.access_token;
        return this.getData(settings, { url });
      })
      .catch(err => err);
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
      ? superagent.post(composeUrl(settings.credentials.grantorUrl, options))
      : superagent
          .post(settings.credentials.grantorUrl)
          .field('client_id', settings.credentials.clientId)
          .field('client_secret', settings.credentials.clientSecret)
          .field('grant_type', 'authorization_code')
          .field('redirect_uri', `${config.baseUrl}/spaces/callback/${settings.space}`)
          .field('code', code);

    return request
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .then(async result => {
        const token = await this.tokenService.register({ ...result.body, owner: settings.owner, space: settings.space }, settings).then(token => token);
        return token;
      })
      .catch(({ response }) => ({ error: response.error, body: response.body }));
  }
}
