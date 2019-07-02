export interface IConfig {
  port: number;
  env: string;
  name: string;
  version: string;
  mongodbUrl: string;
  baseUrl: string;
  spaceState: string;
  mongodbTestUrl: string;
  swaggerScheme: 'http' | 'https';
  cacheDuration: number;
  jwtTokenDuration: number;
  redisHost: string;
  redisPort: number;
}

// tslint:disable-next-line
export const GITLAB_VERSION = ''; // DO NOT CHANGE/DELETE - it is changed in gitlab ci for extra version info

export const config: IConfig = {
  port: 10011,
  env: process.env.NODE_ENV || 'dev',
  name: 'oni',
  version: `${require('../../package.json').version}${GITLAB_VERSION}`,
  mongodbTestUrl: 'mongodb://root@PZyvHilceT:localhost:27017/oni-test',
  mongodbUrl: process.env.MONGO_URI || 'mongodb://root:PZyvHilceT@localhost:27017/oni',
  baseUrl: 'https://datawhore.erratik.ca:10011/v1',
  spaceState: 'neverBreakTheChain',
  swaggerScheme: 'https',
  redisHost: process.env.REDIS_HOST || 'oni-redis-cache',
  redisPort: 6379,
  jwtTokenDuration: 60 * 60 * 24, // 24h
  cacheDuration: 60 * 60, // 60min
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
