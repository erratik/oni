import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
import { IDropItem } from './drop-item.schema';
import { DropType } from '../drop.constants';
import { Sources, TimeValues } from '../../app.constants';
import moment = require('moment');

const DropSetSchema = new Schema(
  {
    drops: [
      {
        type: Schema.Types.ObjectId,
        ref: 'DropItems',
        sparse: true,
        unique: true,
      },
    ],
    owner: { type: String, required: true },
    space: { type: String, required: true },
    endpoint: { type: String, required: true },
    keys: [{ type: String }],
    cron: { type: Schema.Types.Mixed, sparse: true },
    // stats: { type: Schema.Types.Mixed },
    navigation: { type: Schema.Types.Mixed },
    cursors: { type: Schema.Types.Mixed },
    type: { type: String, default: DropType.Default },
    request: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
  },
);

const composeEndpoint = dropset => {
  let endpoint = dropset.endpoint;
  const isSpreadSheetFetch = endpoint.includes('spreadsheets');
  const { after, before } = dropset.navigation || { after: null, before: null };
  // dropset.dropSetModel.schema.methods.getCursors();
  switch (dropset.space) {
    // case Sources.Spotify:
    //   endpoint += `?after=${after}`;
    //   break;
    // case Sources.Instagram:
    //   endpoint += `?min_id=${after}`;
    //   break;
    // case Sources.Twitter:
    //   // this.populate('drops');
    //   // debugger;
    //   endpoint += `?since_id=${after}`;
    //   break;
    case Sources.GoogleApi:
      if (isSpreadSheetFetch) {
        endpoint += `${after}:${before}`; // row ranges
      }
      break;
    default:
      break;
  }
  return endpoint;
};

DropSetSchema.statics.getCursors = (dropset, params) => {
  let moments: moment.Moment[];
  const { space, drops, name } = dropset;

  let ids: number[] = [];
  let cursors = null;
  const timestampDelta = params.timestamp.delta;
  moments = !!drops && drops.length ? drops.map(drop => moment(drop[timestampDelta])) : [moment.now()];
  const { min, max } = { min: moment.min(moments), max: moment.max(moments) };

  switch (space) {
    case Sources.Instagram:
      const suffix: string = drops[0].id.split('_')[1];
      ids = drops.map(drop => drop.toObject().id.split('_')[0]);
      cursors = { after: `${Math.max(...ids)}_${suffix}`, before: `${Math.min(...ids)}_${suffix}` };
      break;
    case Sources.Twitter:
      ids = drops.length ? drops.map(drop => drop.toObject().id_str) : [0];
      cursors = { after: `${Math.max(...ids)}`, before: `${Math.min(...ids)}` };
      // case Sources.GoogleApi:
      // if (!!options) return { after: 1, before: options.dropCount };
      break;
    default:
      cursors = name.includes('activity')
        ? {
            after: max
              .add(1, TimeValues.Day)
              .startOf(TimeValues.Day)
              .valueOf(),
            before: min
              .add(1, TimeValues.Day)
              .endOf(TimeValues.Day)
              .valueOf(),
          }
        : { after: max.valueOf(), before: min.valueOf() };
  }

  dropset.set('navigation', !drops ? { after: Date.now() } : cursors);

  if (params.cursor.after === 'after') {
    return cursors;
  }

  const entries = Object.entries(params.cursor) as string[][];
  cursors = entries.map(param => {
    const entry = {};
    entry[param[1]] = cursors[param[0]];
    return entry;
  });

  return cursors;
};

DropSetSchema.virtual('name').get(function () {
  return this.type === DropType.Default ? this.space : `${this.space}_${this.type}`;
});

DropSetSchema.virtual('url').get(function () {
  return composeEndpoint(this);
});

DropSetSchema.virtual('body').get(function () {
  if (!this.request) {
    return null;
  }

  const isSpreadSheetFetch = this.endpoint.includes('spreadsheets');
  let body = this.request;

  switch (this.space) {
    case Sources.GoogleApi:
      if (!isSpreadSheetFetch) {
        body = {
          ...body,
          startTimeMillis: this.navigation.after,
          endTimeMillis: moment(this.navigation.after)
            .endOf('day')
            .valueOf(),
        };
      } else {
        body = { requests: [this.request] };
      }
      break;
    default:
      break;
  }
  return body;
});

DropSetSchema.plugin(passportLocalMongoose);

export default DropSetSchema;

export interface IDropSet extends Document {
  owner: string;
  space: string;
  type: string;
  name: string;
  endpoint: string;
  // request: any;
  body: any;
  navigation: any;
  cursors: any;
  cron?: any;
  drops?: IDropItem[];
  keys?: string[];
}
