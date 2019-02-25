import { IConfig } from '../config/config';
import { configProd } from './config.production-env';
import { Injectable } from '@nestjs/common';
import { config } from './config';

@Injectable()
export class ConfigService {
  private env: string = process.env.NODE_ENV || 'dev';
  public swaggerBasePath: string = process.env.SWAGGER_BASE_PATH || '/';
  isUnitTestMode: any;

  constructor() {}

  public get isDevMode(): boolean {
    return this.env.includes('dev');
  }

  public get config(): IConfig {
    switch (process.env.NODE_ENV) {
      case 'prod':
        return configProd;
      default:
        return config;
    }
  }
}
