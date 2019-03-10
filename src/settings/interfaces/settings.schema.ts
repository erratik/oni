import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';

// const credentialsSchema = new Schema(
//   {
//     clientId: { type: String, required: true, unique: true },
//     clientSecret: { type: String, required: true, unique: true },
//     callbackUrl: { type: Date, required: true },
//   },
//   { timestamps: true }
// );

const credentialsSchema = new Schema(
  {
    clientId: { type: String, required: true },
    clientSecret: { type: String, required: true },
    callbackUrl: { type: String, required: true },
    scope: { type: String, required: true },
  },
  { timestamps: true }
);

const SettingsSchema = new Schema(
  {
    space: { type: String, required: true, unique: true },
    owner: { type: String },
    credentials: [credentialsSchema],
  },
  { timestamps: true }
);

export interface ICredentials extends Document {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scope: string;
  updatedAt: Date;
}

export interface ISettings extends Document {
  space: string;
  owner: string;
  credentials?: Array<any>;
}

SettingsSchema.plugin(passportLocalMongoose);

export default SettingsSchema;
