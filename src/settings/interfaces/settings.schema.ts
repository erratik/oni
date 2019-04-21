import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
import { IToken } from '../../token/interfaces/tokens.schema';

const AuthorizationSchema = new Schema(
  {
    url: { type: String, required: true, unique: true },
    info: {
      type: Schema.Types.ObjectId,
      ref: 'Tokens',
    },
  },
  { timestamps: true }
);

const CredentialsSchema = new Schema(
  {
    clientId: { type: String, required: true },
    clientSecret: { type: String, required: true },
    scopes: { type: String },
    grantorUrl: { type: String },
  },
  { timestamps: true }
);

const SettingsSchema = new Schema(
  {
    space: { type: String, required: true, unique: true },
    baseUrl: { type: String, required: true },
    owner: { type: String },
    authorization: { type: AuthorizationSchema },
    credentials: { type: CredentialsSchema },
  },
  { timestamps: true }
);

export interface IAuthorization extends Document {
  url: string;
  info?: IToken;
}

export interface ICredentials extends Document {
  clientId: string;
  clientSecret: string;
  grantorUrl: string;
  scopes: string;
}

export interface ISettings extends Document {
  space: string;
  owner: string;
  baseUrl: string;
  credentials?: ICredentials;
  authorization?: IAuthorization;
}

SettingsSchema.plugin(passportLocalMongoose);

export default SettingsSchema;
