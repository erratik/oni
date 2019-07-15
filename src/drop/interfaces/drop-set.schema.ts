import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
import { IDropItem } from './drop-item.schema';
import { DropType } from '../drop.constants';
import { Sources, TimeFragments } from '../../app.constants';
import moment = require('moment');
import { composeUrl } from '../../shared/helpers/request.helpers';

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
    params: { type: Schema.Types.Mixed },
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
    toJSON: {
      virtuals: false,
    },
  },
);

DropSetSchema.statics.getCursors = dropset => {
  let moments: moment.Moment[];
  const { space, name, params } = dropset;
  let { drops } = dropset;

  let ids: number[] = [];
  let cursors = null;
  const timestampDelta = params.timestamp.delta.split(',')[0];

  drops = drops.map(drop => drop.toObject());
  if (dropset.endpoint.includes('spreadsheets')) {
    drops = drops.reverse();
  }
  moments = drops
    .reverse()
    .slice(0, params.limit || 20)
    .map(drop => moment(drop[timestampDelta]));
  const { min, max } = { min: moment.min(moments), max: moment.max(moments) };

  switch (space) {
    case Sources.Instagram:
      const userid: string = drops[0].id.split('_')[1];
      ids = drops.map(drop => drop.id.split('_')[0]);
      cursors = { after: `${Math.max(...ids)}_${userid}`, before: `${Math.min(...ids)}_${userid}` };
      break;
    case Sources.Twitter:
      ids = drops.length ? drops.map(drop => drop.id_str) : [0, 12345];
      cursors = { after: `${Math.max(...ids)}`, before: `${Math.min(...ids)}` };
      break;
    default:
      cursors = name.includes('activity')
        ? {
            after: max
              .add(1, TimeFragments.Day)
              .startOf(TimeFragments.Day)
              .valueOf(),
            before: max.endOf(TimeFragments.Day).valueOf(),
          }
        : { after: max.valueOf(), before: min.valueOf() };
  }

  dropset.depopulate('drops');

  // todo: change navigation object to min and max
  if (params.cursor.after === 'after') {
    return cursors;
  }

  const computedCursors = {};
  (Object.entries(params.cursor) as string[][]).forEach(param => {
    if (cursors[param[0]] !== '0') {
      computedCursors[param[1]] = cursors[param[0]];
    }
  });

  return computedCursors;
};

DropSetSchema.virtual('name').get(function () {
  return this.type === DropType.Default ? this.space : `${this.space}_${this.type}`;
});

DropSetSchema.virtual('url').get(function () {
  let endpoint = this.endpoint;
  if (!this.cursors) {
    return endpoint;
  }

  // todo: confusing, should after field, not before, for spotify...
  const { before } = this.cursors || this.navigation;

  switch (this.space) {
    case Sources.Spotify:
      endpoint = composeUrl(endpoint, { after: before, ...this.request });
      break;
    case Sources.Instagram:
      const { min_id } = this.cursors || this.navigation;
      endpoint = composeUrl(endpoint, { min_id, ...this.request });
      break;
    case Sources.Twitter:
      const { since_id } = this.cursors || this.navigation;
      endpoint = composeUrl(endpoint, { since_id, ...this.request });
      break;
    case Sources.GoogleApi:
      if (this.type === DropType.Location) {
        endpoint += `A1:AAH${this.params.limit + 1}?majorDimension=ROWS`;
        this.set('request.requests.0.deleteDimension.range.endIndex', this.params.limit);
      }
      break;
    default:
      break;
  }
  return endpoint;
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
          startTimeMillis: this.cursors.after,
          endTimeMillis: this.cursors.before,
        };
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
  params: any;
  body: any;
  navigation: any;
  cursors: any;
  stats: any;
  cron?: any;
  drops?: IDropItem[];
  keys?: string[];
}
