import * as request from 'superagent';
import { Injectable, Inject } from '@nestjs/common';
import { InjectionTokens, AuthenticationHeaders, UbiServicesTicketScheme } from './../app.constants';
import { ConfigService } from './../config/config.service';
import { ICacheService } from './../shared/cache/cache.service';
import { LoggerService } from './../shared/services/logger.service';
import { ErrorCode, ErrorModel } from '../shared/models/error.model';

@Injectable()
export class AuthorizationService {
  private readonly authorizedCacheDurationInSeconds: number = 60 * 60; // 1h
  private readonly unauthorizedTicketCacheDurationInSeconds: number = 30; // 30sec

  constructor(
    @Inject(InjectionTokens.CacheService)
    private readonly cacheService: ICacheService,
    private logger: LoggerService,
    private configService: ConfigService,
  ) {}

  public buildCacheKey(req: any): string {
    return [
      this.getHeaderValue(req.headers, AuthenticationHeaders.UbiAppId),
      this.getHeaderValue(req.headers, AuthenticationHeaders.UbiSessionId),
      req.headers.authorization.substr(req.headers.authorization.indexOf('=') + 1),
      req.headers.authorization.split(' ')[0].toLowerCase(),
    ].join('-');
  }

  public async isRequestAuthorized(req: any): Promise<boolean> {
    this.logger.log('AuthorizationService', 'Checking Authorization');
    if (!req.headers.authorization) {
      throw {
        code: ErrorCode.AUTHORIZATION_MISSING,
        message: 'Authorization header missing',
        serviceName: 'AUTHORIZATION_SERVICE',
      } as ErrorModel;
    }
    const cacheKey: string = this.buildCacheKey(req);
    let cachedValue: string = await this.cacheService.getFromCache<string>(cacheKey);
    let isAuthorized: boolean = false;
    if (cachedValue === null) {
      const lock = await this.cacheService.lock(`locks: ${cacheKey}`, 500);
      cachedValue = await this.cacheService.getFromCache<string>(cacheKey);

      if (cachedValue === null) {
        try {
          isAuthorized = await this.isAuthorized(
            this.getHeaderValue(req.headers, AuthenticationHeaders.UbiAppId),
            this.getHeaderValue(req.headers, AuthenticationHeaders.UbiSessionId),
            req.headers.authorization.substr(req.headers.authorization.indexOf('=') + 1),
            req.headers.authorization.split(' ')[0].toLowerCase(),
          );
          this.cacheService.setItem(
            cacheKey,
            isAuthorized ? this.authorizedCacheDurationInSeconds : this.unauthorizedTicketCacheDurationInSeconds,
            isAuthorized.toString(),
          );
        } catch (error) {
          return Promise.reject(error);
        }
      }
      if (!!lock) {
        lock.unlock();
      }
      cachedValue = await this.cacheService.getFromCache<string>(cacheKey);
    }
    return cachedValue === true.toString();
  }

  public isAuthorized(ubiAppId: string, ubiSessionId: string, ticket: string, ticketScheme: string): Promise<boolean> {
    this.logger.log('AuthorizationService', 'Fetching Authorization');
    if (ticketScheme === UbiServicesTicketScheme.S2S) {
      return this.isAuthorizedThroughS2S(ubiAppId, ubiSessionId, ticket);
    }

    // if (ticketScheme === UbiServicesTicketScheme.Admin) {
    //   return this.isAuthorizedThroughAdmin(ubiAppId, ubiSessionId, ticket);
    // }

    throw {
      code: ErrorCode.AUTHENTICATION_METHOD_NOT_VALID,
      // tslint:disable-next-line:max-line-length
      message: `${ticketScheme} is not a valid scheme. Only '${UbiServicesTicketScheme.S2S}' and '${UbiServicesTicketScheme.Admin}' are accepted.`,
      serviceName: 'AUTHORIZATION_SERVICE',
    } as ErrorModel;
  }

  public async isAuthorizedThroughS2S(ubiAppId: string, ubiSessionId: string, ticket: string): Promise<boolean> {
    try {
      this.logger.log('AuthorizationService', 'Checking S2S Authorization');
      // await this.getApplicationPermissions(ubiAppId, ubiSessionId, ticket);
      return true;
    } catch (_) {
      return false;
    }
  }

  private getHeaderValue(headers: any, headerName: string): string {
    return Object.keys(headers)
      .map(key => {
        const regExp = new RegExp(`${headerName}`, 'i');
        if (regExp.test(key)) {
          return String(headers[key]);
        }
        return '';
      })
      .filter(value => value)[0];
  }
  // public async getApplicationPermissions(
  //   ubiAppId: string,
  //   ubiSessionId: string,
  //   ticket: string,
  // ): Promise<ApplicationPermissions> {
  //   this.logger.log(
  //     'AuthorizationService',
  //     `Checking Application ${ubiAppId} Permissions`,
  //   );
  //   // tslint:disable-next-line:max-line-length
  //   const url: string = `${
  //     this.configService.config.s2sTicketUrl
  //   }/v2/applications/${ubiAppId}/permissions`;
  //   const response = await request
  //     .get(url)
  //     .set(AuthenticationHeaders.UbiAppId, ubiAppId)
  //     .set(
  //       AuthenticationHeaders.Authorization,
  //       `${UbiServicesTicketScheme.S2S} t=${ticket}`,
  //     )
  //     .set(AuthenticationHeaders.UbiSessionId, ubiSessionId);

  //   return response.body;
  // }

  // public async isAuthorizedThroughAdmin(
  //   ubiAppId: string,
  //   ubiSessionId: string,
  //   ticket: string,
  // ): Promise<boolean> {
  //   try {
  //     this.logger.log('AuthorizationService', 'Checking Admin Authorization');
  //     const {
  //       platformType,
  //     }: UbiservicesProfile = await this.getUbiservicesProfile(
  //       ubiAppId,
  //       ubiSessionId,
  //       ticket,
  //     );
  //     return platformType === 'ad';
  //   } catch (_) {
  //     return false;
  //   }
  // }

  // public async getUbiservicesProfile(
  //   ubiAppId: string,
  //   ubiSessionId: string,
  //   ticket: string,
  // ): Promise<UbiservicesProfile> {
  //   this.logger.log('AuthorizationService', 'Fetching Ubiservices profiles');
  //   const response = await request
  //     .get(`${this.configService.config.ubiServicesAdminUrl}/v3/profiles/me`)
  //     .set(AuthenticationHeaders.UbiAppId, ubiAppId)
  //     .set(
  //       AuthenticationHeaders.Authorization,
  //       `${UbiServicesTicketScheme.Admin} t=${ticket}`,
  //     )
  //     .set(AuthenticationHeaders.UbiSessionId, ubiSessionId);

  //   return response.body;
  // }
}
