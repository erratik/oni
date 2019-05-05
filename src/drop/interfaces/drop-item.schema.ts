import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';

const DropItemSchema = new Schema({}, { timestamps: true, strict: false });

export interface IDropItem extends Document {
  owner: string;
  space: string;
  //? standrad attributes could be here
}

DropItemSchema.index({ id: 1 }).plugin(passportLocalMongoose);

export default DropItemSchema;
