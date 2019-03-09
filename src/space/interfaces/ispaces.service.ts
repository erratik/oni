import { ISpace } from './space.schema';

export interface ISpacesService {
  findAll(): Promise<ISpace[]>;
  findById(id: string): Promise<ISpace | null>;
  findOne?(options: object): Promise<ISpace | null>;
  create(space: ISpace): Promise<ISpace>;
  update(space: ISpace): Promise<ISpace | null>;
  delete?(space: ISpace): Promise<string>;
}
