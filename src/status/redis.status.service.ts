import { InjectionTokens } from './../app.constants';
import { RedisCacheService } from './../shared/cache/redis-cache.service';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class RedisStatusService {

  constructor(
    @Inject(InjectionTokens.CacheService)
    private readonly redisService: RedisCacheService) {
  }

  public async getStatus(): Promise<string> {
    try {
      await this.redisService.ping();
      return Promise.resolve('Connected');
    } catch (error) {
      return Promise.reject(error || 'Disconnected');
    }
  }
}
