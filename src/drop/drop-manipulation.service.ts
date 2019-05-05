import * as btoa from 'btoa';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { Sources } from '../app.constants';
import { IDropItem } from './interfaces/drop-item.schema';
import { flatten } from '../shared/helpers/dataset.helpers';
import { AttributeType } from '../attributes/attributes.constants';
import { IAttribute } from '../attributes/interfaces/attribute.schema';
import { IDropKey } from './interfaces/drop-schema.schema';

@Injectable()
export class DropManipulatorService {
  public constructor(public logger: LoggerService) {}

  public convertDatesToIso(data: {}) {
    return data ? JSON.parse(JSON.stringify(data).replace(/(\d{4}-\d{2}-\d{2})\b/g, `$1T00:00:00.000Z`)) : null;
  }

  public identifyDrops(space: string, owner: string, drops: IDropItem[]): IDropItem[] {
    return drops.map((item: IDropItem) => {
      if (!item.id) {
        switch (space) {
          case Sources.Spotify:
            item.id = btoa(item['played_at'] + item['track']['id']);
            break;
          default:
            item.id = btoa(Math.random());
        }
      }
      return Object.assign(item, { owner, space });
    });
  }

  public mapDropKeys(drops: IDropItem[]) {
    let dropKeys = new Set();
    let dropKeySets = [];

    this.flattenDrops(drops, dropKeySets);
    dropKeySets.forEach(set => set.forEach(val => dropKeys.add(val)));

    const arrayKeys = new Set(
      Array.from(dropKeys)
        .filter(key => key.includes('|'))
        .map(key => key.replace(/\|+[\w\.]*/, ''))
    );

    return { mappedKeys: Array.from(dropKeys).concat(Array.from(arrayKeys)), arrayKeys };
  }

  public mapDropAttributes(drops: IDropItem[], arrayKeys: Set<string>, space: string): IAttribute[] {
    const flatDrops = this.flattenDrops(drops);
    const attributes = Array.from(arrayKeys).map(
      key =>
        ({
          space,
          type: AttributeType.array,
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

  private flattenDrops(drops: IDropItem[], dropKeySets?) {
    return drops.map(drop => {
      const flattenedDrop = flatten(drop);
      const keys: IDropKey[] = Object.keys(flattenedDrop).map(path => {
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
        }
        return {
          type: determinedType,
          path,
        } as IDropKey;
      });
      if (dropKeySets) {
        dropKeySets.push(new Set(keys.map(({ path }) => path)));
      }
      return keys;
    });
  }
}
