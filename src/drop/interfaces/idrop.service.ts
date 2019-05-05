import { ISettings } from '../../settings/interfaces/settings.schema';
import { IDropSet } from './drop-set.schema';
import { DropSchemaDto } from '../dto/drops.dto';
import { IDropSchema } from './drop-schema.schema';
import { IDropItem } from './drop-item.schema';

export interface IDropService {
  getDropSet(space: string, owner: string, options: any): Promise<IDropSet | null>;
  upsertDropSet(space: string, owner: string, ids?: string[], cursors?: {}): Promise<IDropSet>;
  deleteDropSet?(space: string, owner: string): Promise<string>;
  // toggleDropKey?(path: string): Promise<IDropKey>;
  // saveDropKeys?(keys: DropKeyDto): Promise<IDropKey>;

  getDropSchema(space: string, owner?: string): Promise<IDropSchema | null>;
  updateDropSchema?(schema: DropSchemaDto, settings?: ISettings): Promise<IDropSchema | null>;

  addDrops(space: string, owner: string, drops: IDropItem[], cursors?: {}): Promise<IDropItem[] | null>;
}
