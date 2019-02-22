export interface IConfig {
  port: number;
  env: string;
  name: string;
  version: string;
  mongodbUrl: string;
  mongodbTestUrl: string;
  ubiServicesAdminUrl: string;
  ubiServicesS2SUrl: string;
  prodS2sTicketUrl: string;
  referentialApiUrl: string;
  ubiAppId: string;
  secretKey: string;
  s2sTicketUrl: string;
  swaggerScheme: 'http' | 'https';
  redisHost: string;
  redisPort: number;
  cacheDuration: number;
}

// tslint:disable-next-line
export const GITLAB_VERSION = ''; // DO NOT CHANGE/DELETE - it is changed in gitlab ci for extra version info

export const config: IConfig = {
  port: 4529,
  env: process.env.NODE_ENV || 'dev',
  name: 'dna-oni',
  version: `${require('../../package.json').version}${GITLAB_VERSION}`,
  mongodbTestUrl: 'mongodb://msr-dev-dna01.ubisoft.org:27017/zeldas-api-test',
  mongodbUrl: 'mongodb://msr-dev-dna01.ubisoft.org:27017/zeldas-api',
  ubiServicesAdminUrl: 'https://admin-ubiservices.ubi.com',
  ubiServicesS2SUrl: 'https://s2s-ubiservices.ubi.com',
  prodS2sTicketUrl: 'https://s2s-ubiservices.ubi.com/v1/applications/sessions',
  referentialApiUrl: 'https://test-dna-referential-api.ubisoft.org',
  ubiAppId: '4331f3b6-6949-441d-9f6e-664ba45f9427',
  secretKey: 'yXVi3wo58vvPLvck',
  s2sTicketUrl: 'https://s2s-ubiservices.ubi.com/v1/applications/sessions',
  swaggerScheme: 'https',
  redisHost: 'oni-redis-cache',
  redisPort: 6379,
  cacheDuration: 60 * 60, // one hour
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
