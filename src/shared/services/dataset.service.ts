import * as btoa from 'btoa';
import * as moment from 'moment';
import * as dotProp from 'dot-prop';
import * as activityTypes from 'google-fit-activity-types';
import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { Sources } from '../../app.constants';
import { IDropItem } from '../../drop/interfaces/drop-item.schema';
import { flatten, camelize } from '../helpers/dataset.helpers';
import { AttributeType } from '../../attributes/attributes.constants';
import { IAttribute } from '../../attributes/interfaces/attribute.schema';
import { IDropSchema } from '../../drop-schemas/interfaces/drop-schema.schema';
import { TimestampField, TimestampFormat, DropKeyType, LocationDataColumns } from '../../drop/drop.constants';

@Injectable()
export class DatasetService {
  public constructor(public logger: LoggerService) {}

  public convertDatesToIso(space: string, data: IDropItem[]): IDropItem[] {
    const fields = TimestampField[space].split(',');
    data = data.map(drop => {
      fields.forEach(field => {
        let timestamp: any = drop[field].length === 10 ? drop[field] * 1000 : drop[field];
        timestamp = space === Sources.GoogleApi ? timestamp.substring(0, 13) : timestamp;
        drop[field] = moment(timestamp, TimestampFormat[space]).toISOString();
      });
      return drop;
    });
    return !!data ? data : [];
  }

  public getCursors(space: string, drops: IDropItem[]): any {
    const moments = drops.map(drop => moment(drop[TimestampField[space]]));
    return { after: moment.max(moments).valueOf(), before: moment.min(moments).valueOf() };
  }

  public identifyDrops(space: string, owner: string, drops: IDropItem[]): IDropItem[] {
    return !!drops
      ? drops.map((item: IDropItem) => {
          if (!item.id) {
            switch (space) {
              case Sources.Spotify:
                item.id = btoa(item[TimestampField[space]] + item['track']['id']);
                break;
              case Sources.GoogleApi:
                item.id = !!item['Lat'] ? btoa(item['Time'] + item['Dly']) : btoa(item['startTimeNanos'] + item['endTimeNanos']);
                break;
              default:
                item.id = btoa(item[TimestampField[space]]);
            }
          }
          return Object.assign(item, { owner, space });
        })
      : null;
  }

  public buildDropWithSchema(space: string, drop: IDropItem, schema: IDropSchema): any {
    const dropified = {};
    schema.keyMap.forEach(dropKey => {
      const isArray: boolean = /(\|)([a-z_.]*)+/.test(dropKey.path);
      const dotPath = dropKey.path.replace(/(\|)([a-z_.]*)+/, '');

      const preKeyName = !!dropKey.attribute && dropKey.type === DropKeyType.Standard ? dropKey.attribute['standardName'] : camelize(dotPath);
      dropified[preKeyName] = { label: dropKey.displayName };

      if (isArray || dropKey.format === AttributeType.array) {
        const dropArray: any[] = dotProp.get(drop, dotPath);
        const arrayKey = dropKey.path.split('|').pop();
        dropified[preKeyName].value = dropArray.map(array => array[arrayKey])[0];
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

  public mapDropKeys(space: string, drops: IDropItem[]) {
    let dropKeys = new Set();
    let dropKeySets = [];

    this.flattenDrops(space, drops, dropKeySets);
    dropKeySets.forEach(set => set.forEach(val => dropKeys.add(val)));

    const arrayKeys = new Set(
      Array.from(dropKeys)
        .filter(key => key.includes('|'))
        .map(key => key.replace(/\|+[\w\.]*/, ''))
    );

    return { mappedKeys: Array.from(dropKeys).concat(Array.from(arrayKeys)), arrayKeys };
  }

  public mapDropAttributes(space: string, drops: IDropItem[], arrayKeys: Set<string>): IAttribute[] {
    const flatDrops = this.flattenDrops(space, drops);
    const attributes = Array.from(arrayKeys).map(
      key =>
        ({
          space,
          format: AttributeType.array,
          path: key,
        } as IAttribute)
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

  private flattenDrops(space: string, drops: IDropItem[], dropKeySets?) {
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

  public convertLocations(space: string, data: any): any {
    const keys = data[0];
    data.shift();
    const drops = [];

    const dataColumns = new Set(
      Object.keys(LocationDataColumns)
        .map(value => LocationDataColumns[value])
        .filter(x => !!x && isNaN(x))
    );

    data.forEach((row: any[]) => {
      let values = { type: 'gps' };
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
}
