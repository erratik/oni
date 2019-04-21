import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';

const DropSchemaSchema = new Schema(
  {
    type: [Schema.Types.Mixed],
  },
  { timestamps: true }
);

export interface IDropSchema extends Document {}

DropSchemaSchema.plugin(passportLocalMongoose);

export default DropSchemaSchema;
