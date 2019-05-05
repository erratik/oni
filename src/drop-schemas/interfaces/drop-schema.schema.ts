import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
import { IDropSchema } from '../../drop-schemas/interfaces/drop-schema.schema';

const DropKeySchema = new Schema(
  {
    format: { type: String, required: true },
    type: { type: String, required: true },
    path: { type: String, required: true, unique: true },
    enabled: { type: Boolean, required: true },
    displayName: { type: String, required: true },
    name: { type: String, required: true },
    attribute: {
      type: Schema.Types.ObjectId,
      ref: 'Attributes',
    },
  },
  { _id: false }
);

const DropSchema = new Schema(
  {
    type: { type: String, required: true },
    owner: { type: String, required: true },
    space: { type: String, required: true },
    keyMap: [DropKeySchema],
  },
  { timestamps: true }
);

export interface IDropKey extends Document {
  format: string;
  type: string;
  path: string;
  displayName: string;
  enabled: boolean;
  attribute?: string;
}

export interface IDropSchema extends Document {
  type: string;
  owner: string;
  space: string;
  keyMap: IDropKey[];
}

DropSchema.plugin(passportLocalMongoose);

export default DropSchema;
