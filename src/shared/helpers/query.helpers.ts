import * as moment from 'moment';
import { TimeFormats, TimeFragments } from '../../app.constants';
import { ITimeRange, ITimeRangeOptions } from '../../shared/models/options.model';
import { DropKeyType, TimestampDelta, DropType } from '../../drop/drop.constants';
import { isNumber } from 'util';
import { IDropSchema } from '../../drop-schemas/interfaces/drop-schema.schema';
import { IAttribute } from '../../attributes/interfaces/attribute.schema';

export const mongoQuerify = (query, schemas?: IDropSchema[]) => {
  const { search, owner } = query;
  const timewindow = search.timewindow;
  let { space, type } = search;

  if (search) {
    if (!!space && !!!space.$in) {
      space = space ? { $in: space } : null;
      type = type ? { $in: type.concat([DropType.Default]) } : null;
    }

    const timerange = searchTimeRange({ ...search.timerange, timewindow });
    const timeranges = [];

    if (schemas) {
      schemas.forEach(({ keyMap }) => {
        keyMap
          .filter(({ type }) => type === DropKeyType.Standard)
          .forEach(({ attribute }) => {
            const timestamps = {};
            attribute = attribute as IAttribute;
            if (attribute.standardName === TimestampDelta.default) {
              timestamps[attribute.path.split('.')[0]] = timerange;
              timeranges.push(timestamps);
            }
          });
      });
    } else {
      timeranges.push({ createdAt: timerange });
    }

    const $and: any = [{ owner }];
    if (space) $and.push({ space });
    if (type) $and.push({ type });
    query = { $and, $or: timeranges };
  }

  return query;
};

export const searchTimeRange = (timerange: ITimeRangeOptions): ITimeRange => {
  const { rewind, timewindow } = timerange;

  let { from, to, unit } = timerange;
  from = isNumber(from) ? from : Date.parse(from);
  to = isNumber(to) ? to : Date.parse(to);
  unit = unit || TimeFragments.Day;

  const isCustomRange = !!rewind;
  const start = moment()
    .utcOffset(from)
    .subtract(rewind || 0, unit);
  const end = moment()
    .utcOffset(to)
    .subtract(rewind || 0, unit);

  const _range = isCustomRange ? { $gte: start.startOf(unit), $lte: end.subtract(1, unit).endOf(unit) } : { $gte: moment(from), $lte: moment(to) };

  if (!!timewindow) {
    unit = timewindow.unit || unit;
    const period = timewindow.period;
    const pin = timewindow.pin || true;

    const timewindowRange = {
      start: start.clone().subtract(period, unit),
      end: end.clone(),
    };

    _range.$gte = pin ? timewindowRange.start : timewindowRange.start.startOf(unit);
    _range.$lte = pin ? timewindowRange.end : timewindowRange.end.startOf(unit);
  }

  const range = {
    $gte: _range.$gte.format(TimeFormats.documents),
    $lte: _range.$lte.format(TimeFormats.documents),
  };

  return range;
};

export const sortDrops = (array, key) =>
  array.sort((a, b) => {
    const x = a[key].value;
    const y = b[key].value;
    return x < y ? -1 : x > y ? 1 : 0;
  });
