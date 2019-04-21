import { IToken } from './tokens.schema';
import { TokenDto } from '../../token/dto/token.dto';
import { ISettings } from '../../settings/interfaces/settings.schema';

export interface ITokenService {
  findAll(): Promise<IToken[]>;
  findById(id: string): Promise<IToken | null>;
  findOne?(options: object): Promise<IToken | null>;
  register(token: TokenDto, settings?: ISettings): Promise<IToken>;
  delete?(owner: string, space: string): Promise<string>;
}
