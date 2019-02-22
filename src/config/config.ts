export interface IConfig {
  port: number;
  env: string;
  name: string;
  version: string;
  mongodbUrl: string;
  mongodbTestUrl: string;
  ubiServicesAdminUrl: string;
  ubiServicesS2SUrl: string;
  prodUbiServicesAdminUrl: string;
  prodUbiServicesS2SUrl: string;
  prodS2sTicketUrl: string;
  referentialApiUrl: string;
  ubiAppId: string;
  secretKey: string;
  prodSecretKey: string;
  s2sTicketUrl: string;
  swaggerScheme: 'http' | 'https';
  cacheDuration: number;
  redisHost: string;
  redisPort: number;
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
  ubiServicesAdminUrl: 'https://uat-admin-ubiservices.ubi.com',
  ubiServicesS2SUrl: 'https://uat-s2s-ubiservices.ubi.com',
  prodUbiServicesAdminUrl: 'https://admin-ubiservices.ubi.com',
  prodUbiServicesS2SUrl: 'https://s2s-ubiservices.ubi.com',
  prodS2sTicketUrl: 'https://s2s-ubiservices.ubi.com/v1/applications/sessions',
  referentialApiUrl: 'https://test-dna-referential-api.ubisoft.org',
  ubiAppId: '4331f3b6-6949-441d-9f6e-664ba45f9427',
  secretKey: 'RUlm3K70e04DUOxb2W8MgaYu',
  prodSecretKey: 'yXVi3wo58vvPLvck',
  s2sTicketUrl: 'https://s2s-ubiservices.ubi.com/v1/applications/sessions',
  swaggerScheme: 'https',
  redisHost: process.env.REDIS_HOST || 'oni-redis-cache',
  redisPort: 6379,
  cacheDuration: 5 * 60, // 5 minutes
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
