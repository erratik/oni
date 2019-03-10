import { Schema, Document } from 'mongoose';
import { AuthorizationDBModel } from '../../auth/interfaces/auth.interfaces';
import * as passportLocalMongoose from 'passport-local-mongoose';

const userAuthorizationSchema = new Schema(
  {
    token: { type: String, required: true },
    scope: { type: String, required: true, unique: true },
    expiry: { type: Date, required: true },
  },
  { timestamps: true }
);

const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String },
    authorization: [userAuthorizationSchema],
  },
  { timestamps: true }
);

export interface IUser extends Document {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;
  readonly username: string;
  authorization: Array<AuthorizationDBModel>;
}

UserSchema.plugin(passportLocalMongoose);

export default UserSchema;
