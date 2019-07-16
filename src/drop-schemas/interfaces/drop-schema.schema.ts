import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
import { IDropSchema } from '../../drop-schemas/interfaces/drop-schema.schema';
import { IAttribute } from '../../attributes/interfaces/attribute.schema';

const DropKeySchema = new Schema(
  {
    format: { type: String, required: true },
    type: { type: String, required: true },
    path: { type: String, required: true, unique: true },
    enabled: { type: Boolean, required: true, default: true },
    displayName: { type: String, required: true },
    name: { type: String },
    attribute: {
      type: Schema.Types.ObjectId,
      ref: 'Attributes',
    },
  },
  { _id: false },
);

const DropSchema = new Schema(
  {
    type: { type: String, default: 'default' },
    owner: { type: String, required: true },
    space: { type: String, required: true },
    keyMap: [DropKeySchema],
  },
  { timestamps: true },
);

export interface IDropKey extends Document {
  format: string;
  type: string;
  path: string;
  displayName: string;
  enabled: boolean;
  attribute?: string | IAttribute;
}

export interface IDropSchema extends Document {
  type: string;
  owner: string;
  space: string;
  keyMap: IDropKey[];
}

DropSchema.plugin(passportLocalMongoose);

export default DropSchema;
