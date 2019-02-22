import { IConfig, GITLAB_VERSION } from './config';

export const configProd: IConfig = {
  port: 4529,
  env: process.env.NODE_ENV || 'prod',
  name: 'dna-oni',
  version: `${require('../../package.json').version}${GITLAB_VERSION}`,
  mongodbTestUrl: 'mongodb://msr-dev-dna01.ubisoft.org:27017/zeldas-api-test',
  mongodbUrl: 'mongodb://msr-telemetry-mongo01.ubisoft.onbe:27017/dna-wapi',
  ubiServicesAdminUrl: 'https://uat-admin-ubiservices.ubi.com',
  ubiServicesS2SUrl: 'https://uat-s2s-ubiservices.ubi.com',
  prodUbiServicesAdminUrl: 'https://admin-ubiservices.ubi.com',
  prodUbiServicesS2SUrl: 'https://s2s-ubiservices.ubi.com',
  prodS2sTicketUrl: 'https://s2s-ubiservices.ubi.com/v1/applications/sessions',
  referentialApiUrl: 'https://dna-referential-api.ubisoft.org',
  ubiAppId: '4331f3b6-6949-441d-9f6e-664ba45f9427',
  secretKey: 'RUlm3K70e04DUOxb2W8MgaYu',
  prodSecretKey: 'yXVi3wo58vvPLvck',
  s2sTicketUrl: 'https://s2s-ubiservices.ubi.com/v1/applications/sessions',
  swaggerScheme: 'https',
  redisHost: 'oni-redis-cache',
  redisPort: 6379,
  cacheDuration: 24 * 60 * 60, // one day
};
