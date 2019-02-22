import * as superagent from 'superagent';
import { Injectable, Inject } from '@nestjs/common';
import { InjectionTokens, AuthenticationHeaders } from './../app.constants';
import { ConfigService } from './../config/config.service';
import { UbiServiceS2SSessionData } from './authentication.model';
import { RedisCacheService } from './../shared/cache/redis-cache.service';

@Injectable()
export class AuthenticationService {

  private readonly s2sSessionInfoCacheKey: string = 's2sSessionInfoCacheKey';
  private readonly s2sSessionInfoCacheExpirationInSeconds: number = 3 * 60 * 60; // 3 Hours

  constructor(
    private readonly configService: ConfigService,
    @Inject(InjectionTokens.CacheService) private readonly redisCacheService: RedisCacheService) { }

  async getS2SSessionInfo(): Promise<UbiServiceS2SSessionData> {
    return this.redisCacheService.getItemOrElse<UbiServiceS2SSessionData>(
      this.s2sSessionInfoCacheKey,
      this.s2sSessionInfoCacheExpirationInSeconds,
      () => this.fetchS2SSessionInfo());
  }

  fetchS2SSessionInfo(): Promise<UbiServiceS2SSessionData> {
    const s2sTicketUrl: string = this.configService.config.s2sTicketUrl;

    return superagent
      .post(s2sTicketUrl)
      .set({
        [AuthenticationHeaders.UbiAppId]: this.configService.config.ubiAppId,
        [AuthenticationHeaders.Authorization]: this.getAuthorizationHeader(),
        'Content-Type': 'application/json',
      })
      .then(result => result.body as UbiServiceS2SSessionData);
  }

  getAuthorizationHeader(): string {
    const secretKey: string = process.env.NODE_ENV && process.env.NODE_ENV === 'prod' ?
      this.configService.config.prodSecretKey : this.configService.config.secretKey;

    const buffer: Buffer = new Buffer(
      this.configService.config.ubiAppId + ':' + secretKey,
    );

    return 'Basic ' + buffer.toString('base64');
  }
}
