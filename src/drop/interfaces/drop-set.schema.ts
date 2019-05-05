import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
import { IDropSchema } from '../../drop-schemas/interfaces/drop-schema.schema';
import { IDropItem } from './drop-item.schema';

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
    // stats: { type: Schema.Types.Mixed },
    navigation: { type: Schema.Types.Mixed },
    keys: { type: [String], unique: true },
  },
  { timestamps: true }
);

export interface IDropSet extends Document {
  owner: string;
  space: string;
  endpoint: string;
  drops?: IDropItem[];
  schemas?: IDropSchema[];
  keys: string[];
  navigation: any;
}

DropSetSchema.plugin(passportLocalMongoose);

export default DropSetSchema;
