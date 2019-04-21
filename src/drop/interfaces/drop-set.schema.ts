import { Schema, Document, SchemaType } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
import DropSchemaSchema, { IDropSchema } from './drop-schema.schema';
import { IDropItem } from './drop-item.schema';

const DropSetSchema = new Schema(
  {
    drops: [
      {
        type: Schema.Types.ObjectId,
        ref: 'DropItems',
      },
    ],
    owner: { type: String, required: true },
    space: { type: String, required: true },
    schemas: { type: [DropSchemaSchema] },
    stats: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export interface IDropSet extends Document {
  owner: string;
  space: string;
  drops?: IDropItem[];
  schemas?: IDropSchema[];
}

DropSetSchema.plugin(passportLocalMongoose);

export default DropSetSchema;
