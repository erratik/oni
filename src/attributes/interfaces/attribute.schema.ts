import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';

const AttributeSchema = new Schema({
  space: { type: String },
  type: { type: String, required: true },
  path: { type: String, required: true, unique: true },
  // displayName: { type: String, required: true },
  // attribute: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'Attributes',
  // },
});

export interface IAttribute extends Document {
  space: string;
  type: string;
  path: string;
}

AttributeSchema.index({ path: 1 }).plugin(passportLocalMongoose);

export default AttributeSchema;
