import * as superagent from 'superagent';
import * as btoa from 'btoa';
import * as oauth from 'oauth';
import { Injectable, HttpStatus, Response as Res } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { ISettings } from '../settings/interfaces/settings.schema';
import { TokenService } from '../token/token.service';
import { ConfigService } from '../config/config.service';
import { QueryRequestSources as SpacesV1, DataMethod } from './space.constants';
import { Sources } from '../app.constants';
import { composeUrl, buildConnectParams, createConsumer } from '../shared/helpers/request.helpers';
import { DropType } from '../drop/drop.constants';
import { IToken } from '../token/interfaces/tokens.schema';
import redisClient from '../shared/redis.client';
import { DatasetService } from '../shared/services/dataset.service';
import { IDropItem } from '../drop/interfaces/drop-item.schema';

@Injectable()
export class SpaceRequestService {
  private spacesV1: string[] = [];
  private consumer: oauth.OAuth = null;

  constructor(
    public logger: LoggerService,
    public tokenService: TokenService,
    public datasetService: DatasetService,
    private readonly configService: ConfigService,
  ) {
    for (const n in SpacesV1) {
      this.spacesV1.push(SpacesV1[n]);
    }
  }

  public getAuthenticatedData(settings: ISettings, options: any): Promise<any> {
    const access_token = settings.authorization.info.access_token;
    options.url = (options.url.includes('https://') ? '' : settings.baseUrl) + options.url;

    const method = options.suffix || false;
    const httpMethod = !['post', 'get'].includes(method) ? DataMethod[`${settings.space}_${method}`] : !method ? DataMethod[settings.space] : method;

    if (httpMethod === 'post') {
      return superagent
        .post(options.url)
        .set({ Authorization: `Bearer ${access_token}` })
        .send(options.body || {});
    }

    let querifiedUrl = options.url.includes('https://') ? '' : settings.baseUrl;
    querifiedUrl += composeUrl(options.url, { access_token }).replace(/(^.*?\?.*?)(\?)/gm, '$1&');

    const isBearerRequest = this.spacesV1.some(source => source !== settings.space);
    return isBearerRequest ? superagent.get(options.url).set({ Authorization: `Bearer ${access_token}` }) : superagent.get(querifiedUrl);
  }

  public async getSignedData(stream: any): Promise<any> {
    const { oauthAccessToken, oauthAccessTokenSecret } = stream.settings.authorization.info.oauth;

    const url = `${stream.settings.baseUrl}${stream.dropset.url}`;
    this.consumer = createConsumer(stream.settings, this.configService.config);

    return this.consumer.get(url, oauthAccessToken, oauthAccessTokenSecret, (error, data) => {
      if (error) {
        stream.res.send({ error });
      } else {
        const items: any[] = this.datasetService.convertDrops(stream.dropset, JSON.parse(data));
        stream.done(items);
      }
    });
  }

  public async fetchHandler(settings: ISettings, stream: any) {
    const query = stream.query;

    if (settings.space !== 'twitter') {
      let receivedData = null;
      const body = stream.body;
      const suffix = query.type || DropType.Default;
      const { params, url } = stream.query;

      return await this.hasValidToken(settings, stream.res).then(async () => {
        receivedData = await this.getAuthenticatedData(settings, { url, body, suffix });
        if (!query.consumed && query.type === 'post') {
          return stream.done([], true);
        }
        if (!query.consumed) {
          return stream.res.status(HttpStatus.OK).json(receivedData.body);
        }
        const items: any[] = receivedData.body[params.responsePath] || [];
        const drops = this.datasetService.convertDrops(query, items) as IDropItem[];
        return stream.done(drops);
      });
    }

    if (settings.space === 'twitter') {
      this.getSignedData({ ...stream, settings, dropset: query });
      return { status: 200, space: settings.space };
    }
  }

  private async hasValidToken(settings: ISettings, @Res() res): Promise<boolean> {
    if (!settings) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `No ${settings.space} settings for found for ${settings.owner}` });
    }
    const token = settings.authorization.info;
    if (!token) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `No ${settings.space} token for ${settings.owner}` });
    }

    const isTokenExpired = !!token.updatedAt && (token.updatedAt.valueOf() + token.expires_in * 1000 <= Date.now() && !!token.refresh_token);
    return isTokenExpired
      ? await this.refreshToken(settings)
          .then(() => false)
          .catch((err: any) => (!res ? null : res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err)))
      : isTokenExpired;
  }

  // todo: move this to oauth module
  public async getToken(settings: ISettings, stream: any): Promise<IToken> {
    const code: string = !!stream.code ? stream.code : null;
    const res: any = !!code ? false : stream.res;
    return await this.requestToken(settings, stream)
      .then(token => {
        if (!token.error) {
          return res ? res.status(HttpStatus.OK).json({ token, message: `Successfully saved ${settings.space} token info for ${settings.owner}` }) : token;
        }
        throw token.error;
      })
      .catch(err => (res ? res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err) : err));
  }

  public refreshToken(settings: ISettings): any {
    const itoken = settings.authorization.info;
    const creds = settings.credentials;
    return superagent
      .post(
        composeUrl(creds.grantorUrl, {
          grant_type: 'refresh_token',
          refresh_token: itoken.refresh_token,
        }),
      )
      .set({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa([creds.clientId, creds.clientSecret].join(':'))}`,
      })
      .then(async result => {
        this.tokenService.register({ ...result.body, owner: settings.owner, space: settings.space }, settings);
        itoken.access_token = result.body.access_token;
        return itoken.access_token;
      })
      .catch(err => err);
  }

  public async requestToken(settings: ISettings, stream?: any): Promise<any> {
    if (!!stream && settings.space === Sources.Twitter) {
      this.getOAuthRequestToken(settings, stream);
    } else {
      const creds = settings.credentials;
      const config = this.configService.config;
      const code: string = !!stream.code ? stream.code : null;
      const params = buildConnectParams(settings, config, code);

      const request = this.spacesV1.some(source => source !== settings.space)
        ? superagent.post(composeUrl(creds.grantorUrl, params))
        : superagent
            .post(creds.grantorUrl)
            .field('client_id', creds.clientId)
            .field('client_secret', creds.clientSecret)
            .field('grant_type', 'authorization_code')
            .field('redirect_uri', `${config.baseUrl}/spaces/callback/${settings.space}`)
            .field('code', code);

      try {
        const result = await request.set('Content-Type', 'application/x-www-form-urlencoded');
        return await this.tokenService.register({ ...result.body, owner: settings.owner, space: settings.space }, settings);
      } catch ({ response }) {
        return { error: response.error, body: response.body };
      }
    }
  }

  private async getOAuthRequestToken(settings: ISettings, stream: any): Promise<any> {
    const res = stream.res;
    const req = stream.req;

    this.consumer = stream.consumer;

    await this.consumer.getOAuthRequestToken((error: any, oauthToken: string, oauthTokenSecret: string) => {
      if (error) {
        return { error };
      }

      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;

      redisClient.set(
        `${settings.space}_${req.session.oauthRequestToken}`,
        JSON.stringify({ settings, oauthRequestToken: oauthToken, oauthRequestTokenSecret: oauthTokenSecret, consumer: this.consumer }),
      );

      console.log(`${settings.baseUrl}/oauth/authenticate?oauth_token=${stream.req.session.oauthRequestToken}`);
      res.redirect(HttpStatus.TEMPORARY_REDIRECT, `${settings.baseUrl}/oauth/authenticate?oauth_token=${stream.req.session.oauthRequestToken}`);
    });
  }
}
