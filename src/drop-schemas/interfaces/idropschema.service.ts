import { IDropSchema } from './drop-schema.schema';
import { DropSchemaDto } from '../dto/drop-schema.dto';
import { ISettings } from '../../settings/interfaces/settings.schema';

export interface IDropSchemaService {
  upsertDropSchema(dropSchema: DropSchemaDto): Promise<IDropSchema | null>;
  addDropSchemas(dropSchemas: DropSchemaDto[]): Promise<void>;
  deleteDropSchemas(id: string): Promise<any>;

  getDropSchema(space: string, owner?: string): Promise<IDropSchema | null>;
  updateDropSchema?(schema: DropSchemaDto, settings?: ISettings): Promise<IDropSchema | null>;
}
