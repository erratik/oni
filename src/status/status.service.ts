import { RedisStatusService } from './redis.status.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { IConfig } from '../config/config';
import { Status } from './status.model';
import { LoggerService } from '../shared/services/logger.service';

@Injectable()
export class StatusService {

  constructor(
    private configService: ConfigService,
    private redisStatusService: RedisStatusService,
    private logger: LoggerService) { }

  private get config(): IConfig {
    return this.configService.config;
  }

  public async getStatus(): Promise<Status> {

    const status: Status = {
      serviceName: this.config.name,
      hostName: require('os').hostname(),
      buildVersion: this.config.version,
      dependenciesCheckSuccess: true,
      primaryDependenciesCheckSuccess: true,
      secondaryDependenciesCheckSuccess: true,
      environment: this.config.env,
      statusMessages: { redis: 'OK' },
    };

    const redisStatus = this.redisStatusService.getStatus()
      .catch((err) => {
        status.primaryDependenciesCheckSuccess = false;
        status.statusMessages['redis'] = err.message || err;
      });

    await Promise.all([redisStatus]);

    this.logger.log('StatusService', JSON.stringify(status));

    if (status.primaryDependenciesCheckSuccess) {
      return Promise.resolve(status);
    }
    return Promise.reject(status);
  }
}
