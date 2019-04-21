import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';

const DropItemSchema = new Schema(
  {
    type: [Schema.Types.Mixed],
  },
  { timestamps: true }
);

export interface IDropItem extends Document {
  owner: string;
  space: string;
}

DropItemSchema.plugin(passportLocalMongoose);

export default DropItemSchema;
