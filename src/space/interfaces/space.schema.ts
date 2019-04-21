import { Schema, Document, SchemaTypes } from 'mongoose';
import { AuthorizationDBModel } from '../../auth/interfaces/auth.interfaces';
import * as passportLocalMongoose from 'passport-local-mongoose';

const SpaceSchema = new Schema(
  {
    name: { type: String, required: true },
    icon: { type: String },
    owner: { type: String, required: true },
    profiles: [{ type: SchemaTypes.Mixed, owner: { type: String, required: true, unique: true } }],
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
