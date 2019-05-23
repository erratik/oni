import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
import { IDropItem } from './drop-item.schema';
import { DropType } from '../drop.constants';

const DropSetSchema = new Schema(
  {
    drops: [
      {
        type: Schema.Types.ObjectId,
        ref: 'DropItems',
        unique: true,
      },
    ],
    owner: { type: String, required: true },
    space: { type: String, required: true },
    endpoint: { type: String, required: true },
    keys: [{ type: String }],
    // stats: { type: Schema.Types.Mixed },
    navigation: { type: Schema.Types.Mixed },
    type: { type: String, default: DropType.Default },
    request: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export interface IDropSet extends Document {
  owner: string;
  space: string;
  endpoint: string;
  request: any[];
  navigation: any;
  drops?: IDropItem[];
  keys?: string[];
}

DropSetSchema.plugin(passportLocalMongoose);

export default DropSetSchema;
