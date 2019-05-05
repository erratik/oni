import * as btoa from 'btoa';
import * as moment from 'moment';
import * as dotProp from 'dot-prop';
import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { Sources } from '../../app.constants';
import { IDropItem } from '../../drop/interfaces/drop-item.schema';
import { flatten, camelize } from '../helpers/dataset.helpers';
import { AttributeType } from '../../attributes/attributes.constants';
import { IAttribute } from '../../attributes/interfaces/attribute.schema';
import { IDropKey, IDropSchema } from '../../drop-schemas/interfaces/drop-schema.schema';
import { TimestampField, TimestampFormat } from '../../drop/drop.constants';

@Injectable()
export class DatasetService {
  public constructor(public logger: LoggerService) {}

  public convertDatesToIso(space: string, data: IDropItem[]): IDropItem[] {
    data = data.map(drop => {
      drop[TimestampField[space]] = moment(
        drop[TimestampField[space]].length === 10 ? drop[TimestampField[space]] * 1000 : drop[TimestampField[space]],
        TimestampFormat[space]
      ).toISOString();
      return drop;
    });
    return !!data ? data : [];
  }

  public getCursors(space: string, drops: IDropItem[]): any {
    const moments = drops.map(drop => moment(drop[TimestampField[space]]));
    return { after: moment.max(moments).valueOf(), before: moment.min(moments).valueOf() };
  }

  public identifyDrops(space: string, owner: string, drops: IDropItem[]): IDropItem[] {
    return drops.map((item: IDropItem) => {
      if (!item.id) {
        switch (space) {
          case Sources.Spotify:
            item.id = btoa(item[TimestampField[space]] + item['track']['id']);
            break;
          default:
            item.id = btoa(Math.random());
        }
      }
      return Object.assign(item, { owner, space });
    });
  }

  public buildDropWithSchema(space: string, drop: IDropItem, schema: IDropSchema): any {
    const dropified = {};
    schema.keyMap.forEach(({ path, format, displayName }) => {
      const isArray: boolean = /(\|)([a-z_.]*)+/.test(path);
      const dotPath = path.replace(/(\|)([a-z_.]*)+/, '');
      const preKeyName = camelize(dotPath);
      dropified[preKeyName] = { label: displayName };
      if (isArray || format === AttributeType.array) {
        const dropArray: any[] = dotProp.get(drop, dotPath);
        const arrayKey = path.split('|').pop();
        dropified[preKeyName].value = dropArray.map(array => array[arrayKey])[0];
      } else {
        dropified[preKeyName].value = dotProp.get(drop, dotPath);
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
          type: AttributeType.array,
          path: key,
          // displayName: key,
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
        // see if we can find the type
        const value: string = flattenedDrop[path];
        const isDate: boolean = /\d{4}-\d{2}-\d{2}/.test(value);
        const inArray: boolean = /\[[0-9]+\]*/.test(path);
        let determinedType: string = isDate ? AttributeType.date : typeof flattenedDrop[path];

        if (inArray) {
          path = path.replace(/\[[0-9]+\]\.*/, '|');
          const isArray: boolean = /\|+$/.test(path);
          path = path.replace(/\|+$/, '');
          determinedType = isArray ? AttributeType.array : determinedType;
          // debugger;
        } else {
          // debugger;
        }
        return {
          path,
          space,
          type: determinedType,
          // displayName: path,
        } as IAttribute;
      });
      if (dropKeySets) {
        dropKeySets.push(new Set(keys.map(({ path }) => path)));
      }
      return keys;
    });
  }
}
