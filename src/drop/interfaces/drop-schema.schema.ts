import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
import { IAttribute } from '../../attributes/interfaces/attribute.schema';

const DropKeySchema = new Schema({
  format: { type: String, required: true },
  type: { type: String, required: true },
  path: { type: String, required: true },
  enabled: { type: Boolean, required: true },
  attribute: {
    type: Schema.Types.ObjectId,
    ref: 'Attributes',
  },
});

const DropSchemaSchema = new Schema(
  {
    type: [Schema.Types.Mixed],
  },
  { timestamps: true }
);

export interface IDropKey extends Document {
  format: string;
  type: string;
  path: string;
  enabled: boolean;
  attribute?: IAttribute;
}

export interface IDropSchema extends Document {}

DropSchemaSchema.plugin(passportLocalMongoose);

export default DropSchemaSchema;
