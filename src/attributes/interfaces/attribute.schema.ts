import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';

const AttributeSchema = new Schema({
  space: { type: String },
  format: { type: String, required: true },
  type: { type: String, required: true, default: 'custom' },
  path: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  standardName: { type: String },
});

export interface IAttribute extends Document {
  space: string;
  format: string;
  path: string;
  displayName: string;
  type: string;
  standardName?: string;
}

AttributeSchema.index({ path: 1 }).plugin(passportLocalMongoose);

export default AttributeSchema;
