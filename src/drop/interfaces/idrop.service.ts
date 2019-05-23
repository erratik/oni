import { IDropSet } from './drop-set.schema';
import { IDropItem } from './drop-item.schema';

export interface IDropService {
  getDropSet(space: string, owner: string, options: any): Promise<IDropSet | null>;
  upsertDropSet(space: string, owner: string, ids?: string[], cursors?: {}): Promise<IDropSet>;
  deleteDropSet?(space: string, owner: string): Promise<string>;
  // toggleDropKey?(path: string): Promise<IDropKey>;
  // saveDropKeys?(keys: DropKeyDto): Promise<IDropKey>;

  addDrops(space: string, owner: string, drops: IDropItem[], cursors?: {}): Promise<IDropSet | null>;
}
