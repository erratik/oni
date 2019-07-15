import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
import { IAttribute } from '../../attributes/interfaces/attribute.schema';

const DropItemSchema = new Schema({}, { timestamps: true, strict: false });

export interface IDropItem extends Document {
  owner: string;
  space: string;
  type?: string;
  attribute?: IAttribute;
}

DropItemSchema.index({ id: 1 }).plugin(passportLocalMongoose);

export default DropItemSchema;
