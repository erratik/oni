import { ISettings } from '../../settings/interfaces/settings.schema';
import { IDropSet } from './drop-set.schema';
import { DropSchemaDto } from '../dto/drops.dto';
import { IDropSchema } from './drop-schema.schema';
import { IDropItem } from './drop-item.schema';

export interface IDropService {
  getDropSet(space: string, options: any, owner: string): Promise<IDropSet | null>;
  upsertDropSet(schema: DropSchemaDto, settings?: ISettings): Promise<IDropSet>;
  deleteDropSet?(owner: string, space: string): Promise<string>;

  getDropSchema(space: string, owner?: string): Promise<IDropSchema | null>;
  updateDropSchema(schema: DropSchemaDto, settings?: ISettings): Promise<IDropSchema | null>;

  addDrops(drops: IDropItem[]): Promise<IDropItem[] | null>;
}
