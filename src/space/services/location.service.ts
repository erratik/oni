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

  public listMajors(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Class Data!A2:E',
      },
      (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
          console.log('Name, Major:');
          // Print columns A and E, which correspond to indices 0 and 4.
          rows.map(row => {
            console.log(`${row[0]}, ${row[4]}`);
          });
        } else {
          console.log('No data found.');
        }
      }
    );
  }
}
