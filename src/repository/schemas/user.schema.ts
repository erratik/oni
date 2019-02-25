import { Schema } from 'mongoose';

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  lastModified: { type: Date, required: true, default: Date.now },
  createdBy: { type: String, required: true, default: 'system' },
  label: { type: String },
});

export default userSchema;

/**
  "username": "admin",
  "password": "password",
  "lastModified": "2019-02-25T06:02:51.495Z",
  "createdBy": "system",
  "label": "admin",
 */
