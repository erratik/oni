import { Schema } from 'mongoose';

const userAuthorizationSchema = new Schema(
  {
    accessToken: { type: String, required: true },
    scope: { type: String, required: true, unique: true },
    expiry: { type: Date, required: true },
  },
  { timestamps: true }
);

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    authorization: [userAuthorizationSchema],
  },
  { timestamps: true }
);

export default userSchema;
