import * as btoa from 'btoa';
import * as moment from 'moment';
import * as dotProp from 'dot-prop';
import * as activityTypes from 'google-fit-activity-types';
import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { Sources, TimeValues } from '../../app.constants';
import { IDropItem } from '../../drop/interfaces/drop-item.schema';
import { flatten, camelize } from '../helpers/dataset.helpers';
import { AttributeType } from '../../attributes/attributes.constants';
import { IAttribute } from '../../attributes/interfaces/attribute.schema';
import { IDropSchema } from '../../drop-schemas/interfaces/drop-schema.schema';
import { TimestampDelta, TimestampFormat, DropKeyType, LocationDataColumns, DropType, Numbers } from '../../drop/drop.constants';

@Injectable()
export class DatasetService {
  public constructor(public logger: LoggerService) {}

  // * PRE PROCESSING
  public convertDatesToIso(conversionKey: string, drops: IDropItem[]): IDropItem[] {
    const space = conversionKey.split('_')[0];
    const fields = TimestampDelta[conversionKey].split(',');
    const data = !!drops
      ? drops.map(drop => {
          fields.forEach((field: string) => {
            let timestamp: any = drop[field].length === 10 ? drop[field] * 1000 : drop[field];
            timestamp = space === Sources.GoogleApi ? timestamp.substring(0, 13) : timestamp;
            drop[field] = moment(timestamp, TimestampFormat[space]).toISOString();
          });
          return drop;
        })
      : null;
    return !!data ? data : [];
  }

  public identifyDrops(space: string, owner: string, drops: IDropItem[], type = DropType.Default): IDropItem[] {
    return !!drops
      ? drops.map((item: IDropItem) => {
          if (!item.id) {
            switch (space) {
              case Sources.Spotify:
                item.id = btoa(item[TimestampDelta[space]] + item['track']['id']);
                break;
              case Sources.GoogleApi:
                item.id = !!item['Lat'] ? btoa(item['Time'] + item['Dly']) : btoa(item['startTimeNanos'] + item['endTimeNanos']);
                break;
              default:
                item.id = btoa(item[TimestampDelta[space]]);
            }
          }
          return Object.assign(item, { owner, space, type });
        })
      : null;
  }

  public convertLocations(space: string, data: any): any {
    const keys = data[0];
    data.shift();
    const drops = [];

    const dataColumns = new Set(
      Object.keys(LocationDataColumns)
        .map(value => LocationDataColumns[value])
        .filter(x => !!x && isNaN(x)),
    );

    data.forEach((row: any[]) => {
      const values = { type: DropType.GPS };
      row.filter((cell, i) => {
        const isIncluded: boolean = dataColumns.has(keys[i]);
        if (isIncluded) {
          values[keys[i]] = isNaN(cell) ? cell : parseFloat(cell);
        }
        return isIncluded;
      });
      drops.push(values);
    });

    return drops;
  }

  public getCursors(conversionKey: string, drops: IDropItem[], options?): any {
    let moments: moment.Moment[];
    const space = conversionKey.split('_')[0];
    switch (space) {
      case Sources.Instagram:
        const suffix: string = drops[0].id.split('_')[1];
        const ids: number[] = drops.map(({ id }) => id.split('_')[0] as number);
        return { after: `${Math.max(...ids)}_${suffix}`, before: `${Math.min(...ids)}_${suffix}` };
      // case Sources.GoogleApi:
      // if (!!options) return { after: 1, before: options.dropCount };
      default:
        const timestampDelta = TimestampDelta[conversionKey].split(',')[0];
        moments = drops.map(drop => moment(drop[timestampDelta]));
        const { min, max } = { min: moment.min(moments), max: moment.max(moments) };
        const cursors = conversionKey.includes('activity')
          ? {
              after: max
                .add(1, TimeValues.Day)
                .startOf(TimeValues.Day)
                .valueOf(),
              before: min
                .add(1, TimeValues.Day)
                .endOf(TimeValues.Day)
                .valueOf(),
            }
          : { after: max.valueOf(), before: min.valueOf() };

        return cursors;
    }
  }

  // * CONSUMPTION
  public buildDropWithSchema(space: string, drop: IDropItem | any, schema: IDropSchema): any {
    const dropified = {};
    schema.keyMap.forEach(dropKey => {
      const isArray: boolean = /(\|)([a-z_.]*)+/.test(dropKey.path);
      const dotPath = dropKey.path.replace(/(\|)([a-z_.]*)+/, '');

      const preKeyName = !!dropKey.attribute && dropKey.type === DropKeyType.Standard ? dropKey.attribute['standardName'] : camelize(dotPath);
      dropified[preKeyName] = { label: dropKey.displayName };

      if (isArray || dropKey.format === AttributeType.array) {
        const dropArray: any[] = dotProp.get(drop, dotPath);
        const arrayKey = dropKey.path.split('|').pop();
        const values = dropArray.map(array => array[arrayKey]);
        dropified[preKeyName].value = values.length > 1 ? dropArray.map(array => array[arrayKey]) : values; // dropArray.map(array => array[arrayKey])[0];
      } else {
        dropified[preKeyName].value = dotProp.get(drop, dotPath);
      }
      switch (space) {
        case Sources.GoogleApi:
          dropified[preKeyName].value = dropified[preKeyName].label === 'Activity' ? activityTypes[dropified[preKeyName].value] : dropified[preKeyName].value;
          break;
        default:
          break;
      }
    });
    return dropified;
  }

  // * EXTRA PROCESSING FOR ATTRIBUTES
  public mapDropKeys(space: string, drops: IDropItem[]) {
    const dropKeys = new Set();
    const dropKeySets = [];

    this.flattenDrops(space, drops, dropKeySets);
    dropKeySets.forEach(set => set.forEach(val => dropKeys.add(val)));

    const arrayKeys = new Set(
      Array.from(dropKeys)
        .filter((key: string) => key.includes('|'))
        .map((key: string) => key.replace(/\|+[\w\.]*/, '')),
    );

    return { arrayKeys, mappedKeys: Array.from(dropKeys).concat(Array.from(arrayKeys)) };
  }

  public mapDropAttributes(space: string, drops: IDropItem[], arrayKeys: Set<string>): IAttribute[] {
    const flatDrops = this.flattenDrops(space, drops);
    const attributes = Array.from(arrayKeys).map(
      key =>
        ({
          space,
          format: AttributeType.array,
          path: key,
        } as IAttribute),
    );

    const _attributes = Array.prototype.concat.apply([], flatDrops);
    const _map = new Map();
    for (const attribute of _attributes) {
      if (!_map.has(attribute.path)) {
        _map.set(attribute.path, true); // set any value to Map
        attributes.push(attribute);
      }
    }

    return attributes;
  }

  // * UTILS
  private flattenDrops(space: string, drops: IDropItem[], dropKeySets?) {
    // debugger;
    return drops.map(drop => {
      const flattenedDrop = flatten(drop);
      const keys: IAttribute[] = Object.keys(flattenedDrop).map(path => {
        const value: string = flattenedDrop[path];
        const isDate: boolean = /\d{4}-\d{2}-\d{2}/.test(value);
        const inArray: boolean = /\[[0-9]+\]*/.test(path);
        let determinedFormat: string = isDate ? AttributeType.date : typeof flattenedDrop[path];

        if (inArray) {
          path = path.replace(/\[[0-9]+\]\.*/, '|');
          const isArray: boolean = /\|+$/.test(path);
          path = path.replace(/\|+$/, '');
          determinedFormat = isArray ? AttributeType.array : determinedFormat;
        }
        return {
          path,
          space,
          format: determinedFormat,
        } as IAttribute;
      });
      if (dropKeySets) {
        dropKeySets.push(new Set(keys.map(({ path }) => path)));
      }
      return keys;
    });
  }
}
