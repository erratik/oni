import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { InjectionTokens, Sources as Source } from '../app.constants';
import { PassportLocalModel } from 'passport-local-mongoose';
import { TokenDto } from './dto/token.dto';
import { ITokenService } from './interfaces/itokens.service';
import { IToken } from './interfaces/tokens.schema';
import { SettingsService } from '../settings/settings.service';
import { ISettings } from '../settings/interfaces/settings.schema';

@Injectable()
export class TokenService implements ITokenService {
  public constructor(
    @Inject(InjectionTokens.TokenModel) private readonly tokenModel: PassportLocalModel<IToken>,
    public settingsService: SettingsService,
    public logger: LoggerService
  ) {}

  //? Create & Update
  //                                                                                                      //

  public async register(tokenDto: TokenDto, settings: ISettings): Promise<IToken> {
    this.logger.log(`[TokenService]`, `Upserting ${tokenDto.owner}'s token for ${tokenDto.space}`);

    return this.tokenModel
      .findOneAndUpdate({ space: tokenDto.space, owner: tokenDto.owner }, { ...tokenDto }, { upsert: true, new: true, runValidators: true })
      .then(async (token: IToken) => {
        settings.authorization.info = token;
        return await this.settingsService.update(tokenDto.owner, tokenDto.space as Source, settings).then(() => {
          return { ...token.toObject() };
        });
      })
      .catch(error => console.error(error));
  }

  //                                                                                                      //
  //? Retrieve
  //                                                                                                      //

  public async findAll(query = {}): Promise<IToken[]> {
    return await this.tokenModel.find(query).exec();
  }

  public async findById(id: string): Promise<IToken> {
    this.logger.log(`[TokenService]`, `Fetching token with id: ${id}`);
    const token = await this.tokenModel.findById(id);
    return token ? { ...token.toObject() } : null;
  }

  public async getTokenBySpace(owner: string, space: string): Promise<IToken | null> {
    this.logger.log(`[TokenService]`, `Fetching ${owner}'s token for ${space}`);
    const token = await this.tokenModel.findOne({ owner, space });
    return token ? { ...token.toObject() } : null;
  }

  //                                                                                                      //
  //! Delete
  //                                                                                                      //

  async delete(owner: string, space: string): Promise<string> {
    try {
      await this.tokenModel.findOneAndDelete({ space, owner }).exec();
      return `${owner}'s ${space} token has been deleted`;
    } catch (err) {
      console.error(err);
      return `${owner}'s ${space} token could not be deleted`;
    }
  }
}
