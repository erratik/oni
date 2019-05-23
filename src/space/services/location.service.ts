import * as superagent from 'superagent';
import * as btoa from 'btoa';
import { Injectable, HttpStatus, Response } from '@nestjs/common';
import { LoggerService } from '../../shared/services/logger.service';
import { ISettings } from '../../settings/interfaces/settings.schema';
import { TokenService } from '../../token/token.service';
import { ConfigService } from '../../config/config.service';
import * as fs from 'fs';
import * as readline from 'readline';
import { google } from 'googleapis';

@Injectable()
export class LocationService {
  public constructor(public logger: LoggerService, public tokenService: TokenService, private readonly configService: ConfigService) {}
}
