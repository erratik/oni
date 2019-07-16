import { Schema, Document } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';

const StatsSchema = new Schema(
  {
    owner: { type: String },
    space: { type: String },
    type: { type: String },
    manual: { type: Boolean },
    inserted: {
      added: [
        {
          type: Schema.Types.ObjectId,
          ref: 'DropItems',
          sparse: true,
        },
      ],
    },
    error: {
      // type: Schema.Types.Mixed,,
      hasOnlyDuplicates: Boolean,
      duplicates: Number,
      otherErrors: [{ type: Schema.Types.Mixed }],
    },
    status: { type: String },
    range: {
      from: { type: Date },
      to: { type: Date },
    },
    duration: { type: Number },
    username: { type: String, unique: true },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
  },
);

StatsSchema.virtual('inserted.count').get(function () {
  return this.inserted.added.length;
});
StatsSchema.virtual('error.count').get(function () {
  return this.error.otherErrors.length + this.error.duplicates;
});

export interface IStatsEntry extends Document {
  type: string;
  owner: string;
  space: string;
  manual: boolean;
  range: IStatsTimes;
  duration?: number;
  status: string;
  inserted: IStatsInserted;
  error: IStatsErrors;
}

export interface IStatsInserted {
  added: string[];
  wasPartial: boolean;
  count?: number;
}

export interface IStatsErrors {
  hasOnlyDuplicates: boolean;
  duplicates: number;
  otherErrors: any[];
}

export interface IStatsTimes {
  to: Date;
  from: Date;
}

StatsSchema.plugin(passportLocalMongoose);

export default StatsSchema;
