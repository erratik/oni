import { Schema, Document, SchemaTypes } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';

const ProfileSchema = new Schema({
  type: SchemaTypes.Mixed,
  owner: { type: String, required: true },
});

const SpaceSchema = new Schema(
  {
    name: { type: String, required: true },
    icon: { type: String },
    owner: { type: String, required: true },
    profiles: [ProfileSchema],
  },
  { timestamps: true }
);

export interface ISpace extends Document {
  readonly name: string;
  readonly icon: string;
  readonly owner: string;
  readonly profiles: any[];
}

SpaceSchema.plugin(passportLocalMongoose);

export default SpaceSchema;
