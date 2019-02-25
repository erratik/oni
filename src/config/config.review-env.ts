export interface IConfig {
    port: number;
    env: string;
    name: string;
    version: string;
    mongodbUrl: string;
    mongodbTestUrl: string;
    swaggerScheme: 'http' | 'https';
    redisHost: string;
    redisPort: number;
    cacheDuration: number;
}

// tslint:disable-next-line
export const GITLAB_VERSION = ''; // DO NOT CHANGE/DELETE - it is changed in gitlab ci for extra version info

export const config: IConfig = {
    port: 10011,
    env: process.env.NODE_ENV || 'dev',
    name: 'dna-oni',
    version: `${require('../../package.json').version}${GITLAB_VERSION}`,
    mongodbTestUrl: 'mongodb://127.0.0.1:27017/oni-test',
    mongodbUrl: 'mongodb://root:PZyvHilceT@127.0.0.1:27017/oni',
    swaggerScheme: 'https',
    redisHost: 'oni-redis-cache',
    redisPort: 6379,
    cacheDuration: 60 * 60 // one hour
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
