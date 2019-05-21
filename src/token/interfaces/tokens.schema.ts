import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';

const TokenSchema = new Schema(
  {
    access_token: { type: String, required: true, unique: true },
    refresh_token: { type: String },
    owner: { type: String, required: true },
    space: { type: String, required: true },
    token_type: { type: String },
    scope: { type: String },
    expires_in: { type: Number },
  },
  { timestamps: true }
);

export interface IToken extends Document {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  scope?: string;
  owner: string;
  space: string;
  expires_in: number;
  updatedAt: Date;
}

TokenSchema.plugin(passportLocalMongoose);

export default TokenSchema;
