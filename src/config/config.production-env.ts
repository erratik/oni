import { IConfig, GITLAB_VERSION } from './config';

export const configProd: IConfig = {
  port: 10011,
  env: process.env.NODE_ENV || 'prod',
  name: 'dna-oni',
  version: `${require('../../package.json').version}${GITLAB_VERSION}`,
  mongodbTestUrl: 'mongodb://localhost:27017/oni-test',
  mongodbUrl: 'mongodb://root:PZyvHilceT@localhost:27017/oni',
  swaggerScheme: 'https',
  redisHost: 'oni-redis-cache',
  redisPort: 6379,
  jwtTokenDuration: 60 * 60, // 1h
  cacheDuration: 24 * 60 * 60, // one day
};
