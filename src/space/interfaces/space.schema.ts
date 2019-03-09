import { Schema, Document } from 'mongoose';
import { AuthorizationDBModel } from '../../auth/interfaces/auth.interfaces';
import * as passportLocalMongoose from 'passport-local-mongoose';

const SpaceSchema = new Schema(
  {
    name: { type: String, required: true },
    icon: { type: String },
    username: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export interface ISpace extends Document {
  readonly name: string;
  readonly icon: string;
  readonly username: string;
  readonly description: string;
}

SpaceSchema.plugin(passportLocalMongoose);

export default SpaceSchema;
