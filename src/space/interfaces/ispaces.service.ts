import { ISpace } from './space.schema';
import { SpaceDto } from '../../space/dto/space.dto';

export interface ISpacesService {
  findAll(): Promise<ISpace[]>;
  findById(id: string): Promise<ISpace | null>;
  findOne?(options: object): Promise<ISpace | null>;
  create(space: SpaceDto): Promise<ISpace>;
  update(space: SpaceDto): Promise<ISpace | null>;
  delete?(space: SpaceDto): Promise<string>;
}
