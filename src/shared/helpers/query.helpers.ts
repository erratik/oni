import * as moment from 'moment';
import { TimeFormats } from '../../app.constants';
import { ITimeRange, ITimeRangeOptions } from '../../shared/models/options.model';

export const searchTimeRange = (timerange: ITimeRangeOptions): ITimeRange => {
  const { from, to, window, rewind } = timerange;

  const range = window
    ? {
        $gte: moment(from)
          .subtract(rewind || 0, window)
          .startOf(window)
          .add(1, 'day')
          .format(TimeFormats.documents),
        $lte: moment(from)
          .subtract(rewind || 0, window)
          .endOf(window)
          .add(1, 'day')
          .format(TimeFormats.documents),
      }
    : { $gte: moment(from).format(TimeFormats.documents), $lte: moment(to).format(TimeFormats.documents) };

  return range;
};
