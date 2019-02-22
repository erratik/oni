import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
  private logger: Logger = new Logger('');

  public log(service: string, message: string) {
    this.logger.log(`${service} - ${message}`);
  }

  public warn(service: string, message: string) {
    this.logger.warn(`${service} - ${message}`);
  }
}
