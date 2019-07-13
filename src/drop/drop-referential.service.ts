import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { InjectionTokens } from '../app.constants';
import { PassportLocalModel } from 'passport-local-mongoose';
import { TimestampDelta, ResponseItemsPath } from './drop.constants';
// import { IDropSchemaService } from './interfaces/idropschema.service';
// import { IDropSchema, IDropKey } from './interfaces/drop-schema.schema';
// import { DropSchemaDto } from './dto/drop-schema.dto';
// import { DropType } from '../drop/drop.constants';

export interface Timestamp {
  format: string;
  delta: string;
}
export interface Cursor {
  after: string;
  before: string;
}

export interface DropSetInfo {
  responsePath: string;
  timestamp: Timestamp;
  cursor: Cursor;
}

export type DropSetDimensions = Record<string, DropSetInfo>;

export class DropSetHelper {
  constructor() {
    return {
      instagram: {
        responsePath: ResponseItemsPath.instagram,
        timestamp: {
          format: 'x',
          delta: TimestampDelta.instagram,
        },
        cursor: { before: 'max_id', after: 'min_id' },
      },
      spotify: {
        responsePath: ResponseItemsPath.spotify,
        timestamp: {
          format: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
          delta: TimestampDelta.spotify,
        },
        cursor: { before: 'before', after: 'after' },
      },
      twitter: {
        responsePath: null,
        timestamp: {
          format: 'ddd MMM DD HH:mm:ss Z YYYY',
          delta: TimestampDelta.twitter,
        },
        cursor: { before: 'max_id', after: 'since_id' },
      },
      googleapi_activity: {
        responsePath: ResponseItemsPath.googleapi_activity,
        timestamp: {
          format: 'x',
          delta: TimestampDelta.googleapi_activity,
        },
        cursor: { before: 'before', after: 'after' },
      },
      googleapi_gps: {
        responsePath: ResponseItemsPath.googleapi_gps,
        timestamp: {
          format: 'x',
          delta: TimestampDelta.googleapi_gps,
        },
        cursor: { before: 'before', after: 'after' },
      },
    } as DropSetDimensions;
  }

  // private getResponsePath(): string {
  //   return this.
  // }
}
