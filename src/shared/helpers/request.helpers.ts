import { ISettings } from '../../settings/interfaces/settings.schema';
import { IConfig } from '../../config/config';
import { Sources } from '../../app.constants';
import * as oauth from 'oauth';

export const composeUrl = (url: string, params: any, glue = '&', isEncoded = false, isEncapsulated = false): string => {
  const uri = Object.entries(params)
    .map(([key, val]) => {
      val = isEncoded ? encodeURIComponent(val as string) : val;
      val = isEncapsulated ? `"${val}"` : val;
      return `${key}=${val}`;
    })
    .join(glue);
  return `${url}?${uri}`;
};

export const buildConnectParams = (settings: ISettings, config: IConfig, code?: string) => {
  const creds = settings.credentials;

  const params = {
    client_id: creds.clientId,
    redirect_uri: `${config.baseUrl}/spaces/callback/${settings.space}`,
  };

  let addParams: any = !!code
    ? {
        code,
        client_secret: creds.clientSecret,
        grant_type: 'authorization_code',
      }
    : {
        state: `${settings.owner}-${config.state}-${creds.grantorUrl}`,
        scope: creds.scopes,
        response_type: 'code',
      };

  if (!code && settings.space === Sources.GoogleApi) {
    addParams = { ...addParams, include_granted_scopes: 'true', access_type: 'offline' };
  }

  return { ...params, ...addParams };
};

export const createConsumer = (settings: ISettings, config: Partial<IConfig>): oauth.OAuth => {
  const creds = settings.credentials;
  const oauth_callback: string = `${config.baseUrl}/spaces/callback/${settings.space}`;
  return new oauth.OAuth(
    `${settings.baseUrl}/oauth/request_token`,
    `${settings.baseUrl}/oauth/access_token`,
    creds.clientId,
    creds.clientSecret,
    '1.0A',
    oauth_callback,
    'HMAC-SHA1',
  );
};
export const createBearer = (settings: ISettings): oauth.OAuth2 => {
  return new oauth.OAuth2(settings.credentials.clientId, settings.credentials.clientSecret, `${settings.baseUrl}/`, null, 'oauth2/token', null);
};
