import { IUser } from './user.schema';

export interface IUsersService {
  findAll(): Promise<IUser[]>;
  findById(id: string): Promise<IUser | null>;
  findOne?(options: object): Promise<IUser | null>;
  create(user: IUser): Promise<IUser>;
  update(user: IUser): Promise<IUser | null>;
  delete?(id: string): Promise<string>;
}
