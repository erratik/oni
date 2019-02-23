/*
* File doesn't have own test file - If modify, please test.
* How to Test locally:
* - Redis Docker instance running (docker run -d --name redis -p 6379:6379 redis)
* - Modify config.ts pointing redis host to localhost
* - Modify cacheProvider to return RedisCacheService
*/
import * as redis from 'redis';
import { ICacheService } from './cache.service';
import * as Redlock from 'redlock';
import * as Bluebird from 'bluebird';
import { ConfigService } from './../../config/config.service';
import { Injectable } from '@nestjs/common';
import { LoggerService } from './../../shared/services/logger.service';

@Injectable()
export class RedisCacheService implements ICacheService {

  private redisClient: redis.RedisClient;
  private redlock: Redlock;
  private logger: LoggerService = new LoggerService();

  public constructor(private configService: ConfigService) {

    this.redisClient = redis.createClient(
      {
        host: this.configService.config.redisHost,
        port: this.configService.config.redisPort,
        retry_strategy: (options: any) => {

          if (options.error && options.error.code === 'ECONNREFUSED') {
            this.logger.log('CacheService', 'Redis Connection Failed - Server Refused');
            return new Error('The server refused the connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            this.logger.log('CacheService', 'Redis Connection Failed - Retry Time exhausted');
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            this.logger.log('CacheService', 'Redis Connection Failed - No More Retry.');
            return undefined;
          }
          this.logger.log('CacheService', 'Redis Connection Failed - Retrying.');
          return Math.min(options.attempt * 100, 3000);
        },
      });
    this.initializeRedlock();
  }

  private initializeRedlock(): void {
    this.redlock = new Redlock(
      // you should have one client for each independent redis node
      // or cluster
      [this.redisClient],
      {
        // the expected clock drift; for more details
        // see http://redis.io/topics/distlock
        driftFactor: 0.01, // time in ms

        // the max number of times Redlock will attempt
        // to lock a resource before erroring
        retryCount:  10,

        // the time in ms between attempts
        retryDelay:  500, // time in ms

        // the max time in ms randomly added to retries
        // to improve performance under high contention
        // see https://www.awsarchitectureblog.com/2015/03/backoff.html
        retryJitter:  200, // time in ms
      },
    );
  }

  public lock(resource: string, ttl: number): Bluebird<Redlock.Lock> {
    try {
      this.redlock.lock(resource, ttl);
    } catch {
      return Bluebird.resolve(null);
    }
  }

  public async setItem(
    key: string,
    durationInSeconds: number,
    value: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.redisClient
      .setex(key, durationInSeconds, JSON.stringify(value), (err) => {
        if (err) {
          this.logger.log('CacheService', `Redis Set Item Fail - Key: '${key}'`);
          return reject(err);
        }
        this.logger.log('CacheService', `Redis Set Item Success - Key: '${key}'`);
        return resolve();
      });
    });
  }

  public async getItemOrElse<T>(
    key: string,
    durationInSeconds: number,
    fetchObject?: () => Promise<T>): Promise<T> {
    const val: T = await this.getFromCache<T>(key);
    if (val) {
      return val;
    }
    if (fetchObject) {
      const value: T = await fetchObject();
      this.logger.log('CacheService', `Redis Get Item not found - Key: '${key}' - Fetching ...`);
      if (!!value) {
        await this.setItem(key, durationInSeconds, value);
      }
      return this.getFromCache<T>(key);
    }
    return null;
  }

  public getFromCache<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) =>
      this.redisClient.get(key, (error: Error, data: string) => {
        if (error) {
          this.logger.log('CacheService', `Redis Get Item Fail - Key: '${key}' - Error: ${error}`);
        } else if (!!data) {
          this.logger.log('CacheService', `Redis Get Item Success - Key: '${key}'`);
        }
        return resolve(data ? JSON.parse(data) : null);
      }));
  }

  public clearCache(): Promise<void> {
    return new Promise((resolve, reject) =>
      this.redisClient.flushall(error =>
        error ? reject(error) : resolve()));
  }

  public ping(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.redisClient.ping((error, _) => {
        if (error) {
          return reject(error);
        }
        return resolve(true);
      });
    });
  }
}
