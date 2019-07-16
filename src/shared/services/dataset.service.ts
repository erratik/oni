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
import { TimestampDelta, DropKeyType, LocationDataColumns, DropType } from '../../drop/drop.constants';

@Injectable()
export class DatasetService {
  public constructor(public logger: LoggerService) {}

  // * PRE PROCESSING

  public convertDrops(dropset, items) {
    const { space, type, owner, name, params } = dropset;

    if (space === Sources.GoogleApi) {
      // todo: move this to specifc google functions
      if (type === DropType.Location) {
        items = this.convertLocations(items);
      } else {
        items = this.convertDatesToIso(
          dropset,
          Array.prototype.concat
            .apply([], items.map(bucket => bucket.dataset.map(({ point }) => point)))[0]
            .map(someDrop => ({ ...someDrop, value: someDrop.value[0] })),
        );
      }
    } else {
      items = this.convertDatesToIso({ space, type, name, params }, items);
    }
    this.identifyDrops(space, owner, items, type);
    return items as IDropItem[];
  }

  public convertDatesToIso(dropset: any, drops: IDropItem[]): IDropItem[] {
    const { space } = dropset;
    const { format, delta } = dropset.params.timestamp;
    const fields = delta.split(',');
    const data = !!drops
      ? drops.map(drop => {
          fields.forEach((field: string) => {
            let timestamp: any = drop[field].length === 10 ? drop[field] * 1000 : drop[field];
            timestamp = space === Sources.GoogleApi ? timestamp.substring(0, 13) : timestamp;
            drop[field] = moment(timestamp, format).toISOString();
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

  public convertLocations(data: any): any {
    const keys = data[0];
    data.shift();
    const drops = [];

    const dataColumns = new Set(
      Object.keys(LocationDataColumns)
        .map(value => LocationDataColumns[value])
        .filter(x => !!x && isNaN(x)),
    );

    data.forEach((row: any[]) => {
      const values = { type: DropType.Location };
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

  // * CONSUMPTION
  public buildDropWithSchema(drop: IDropItem | any, schema: IDropSchema | any): any {
    const { space, type } = drop;
    const dropified = { space, type };
    schema.keyMap.forEach(dropKey => {
      const isArray: boolean = /(\|)([a-z_.]*)+/.test(dropKey.path);
      const dotPath = dropKey.path.replace(/(\|)([a-z_.]*)+/, '');

      const preKeyName = !!dropKey.attribute && dropKey.type === DropKeyType.Standard ? dropKey.attribute['standardName'] : camelize(dotPath);
      dropified[preKeyName] = { label: dropKey.displayName };

      if (isArray || dropKey.format === AttributeType.array) {
        const dropArray: any[] = dotProp.get(drop, dotPath);

        const arrayKey = dropKey.path.split('|').pop();
        const values = !!dropArray ? dropArray.map(array => (array[arrayKey] ? array[arrayKey] : array)) : null;
        dropified[preKeyName].value = values; // dropArray.map(array => array[arrayKey])[0];
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
