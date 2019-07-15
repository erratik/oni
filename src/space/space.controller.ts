import * as oauth from 'oauth';
import {
  Controller,
  Get,
  UseGuards,
  HttpStatus,
  Response,
  Param,
  Post,
  Body,
  Put,
  Delete,
  Req,
  Query,
  Session,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SpaceService } from './space.service';
import { ApiUseTags } from '@nestjs/swagger';
import { SpaceDto } from './dto/space.dto';
import { SettingsService } from '../settings/settings.service';
import { ConfigService } from '../config/config.service';
import { ISettings } from '../settings/interfaces/settings.schema';
import { IConfig } from '../config/config';
import { SpaceRequestService } from './space-request.service';
import { QueryRequestSources } from './space.constants';
import { Sources } from '../app.constants';
import { composeUrl, buildConnectParams, createConsumer, createBearer } from '../shared/helpers/request.helpers';
import { TokenDto } from '../token/dto/token.dto';
import redisClient from '../shared/redis.client';

@ApiUseTags('spaces')
@Controller('v1/spaces')
export class SpaceController {
  public spacesV1: string[] = [];
  public consumer: oauth.OAuth = null;
  public bearer: oauth.OAuth2 = null;

  constructor(
    private readonly spaceService: SpaceService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    private readonly spaceRequestService: SpaceRequestService,
  ) {
    for (const n in QueryRequestSources) {
      this.spacesV1.push(QueryRequestSources[n]);
    }
  }

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createSpace(@Response() res, @Req() req, @Body() spaceDto: SpaceDto) {
    return await this.spaceService.create({ ...spaceDto, owner: req.user.username }).then(space => res.status(HttpStatus.OK).json(space));
  }

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  async getSpaces(@Response() res) {
    return await this.spaceService.findAll().then(spaces => {
      if (!spaces) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'No spaces',
        });
      } else {
        return res.status(HttpStatus.OK).json(spaces);
      }
    });
  }

  @Get(':space')
  @UseGuards(AuthGuard('jwt'))
  async getSpace(@Param() param, @Response() res) {
    return await this.spaceService.getSpaceByName(param.space).then(space => {
      if (!space) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No space found for ${param.space}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(space);
      }
    });
  }

  @Put('update')
  @UseGuards(AuthGuard('jwt'))
  async updateSpace(@Req() req, @Response() res, @Body() spaceDto: SpaceDto) {
    return await this.spaceService
      .update({ ...spaceDto, owner: req.user.username })
      .then(space => res.status(HttpStatus.OK).json(space))
      .catch(() => {
        debugger;
      });
  }

  @Delete('delete')
  @UseGuards(AuthGuard('jwt'))
  async deleteSpace(@Req() req, @Response() res, @Body() spaceDto: SpaceDto) {
    return await this.spaceService.delete({ ...spaceDto, owner: req.user.username }).then(space => res.status(HttpStatus.OK).json(space));
  }

  @Get('data/:space')
  @UseGuards(AuthGuard('jwt'))
  async spaceRequest(@Param() param, @Query() query, @Response() res, @Req() req, @Body() body = null) {
    const settings: ISettings = req.user.settings.find(({ space }) => space === param.space);
    query.consumed = false;
    return this.spaceRequestService.fetchHandler(settings, { query, res, body });
  }

  @Get('connect/:space')
  @UseGuards(AuthGuard('jwt'))
  async connectSpace(@Param() param, @Response() res, @Req() req) {
    const config: IConfig = this.configService.config;
    const settings: ISettings = req.user.settings.find(({ space }) => space === param.space);

    // todo: check a list of spaces that can use this
    if (param.space === Sources.Twitter) {
      this.consumer = createConsumer(settings, this.configService.config);
      this.bearer = createBearer(settings);

      return await this.spaceRequestService
        .requestToken(settings, { req, res, consumer: this.consumer })
        .catch(error => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error));
    }

    // todo: extract to function in requests helpers
    const params: any = buildConnectParams(settings, config);

    res.set('Authorization', '');
    return res.redirect(HttpStatus.TEMPORARY_REDIRECT, composeUrl(settings.authorization.url, params));
  }

  @Get('callback/:space')
  async spaceCallback(@Param() param, @Response() res, @Req() req, @Session() session) {
    if (!!req.query.error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: req.query.error });
    }

    if (!!req.query.state) {
      const config: Partial<IConfig> = this.configService.config;
      const verification: string = config.state;

      const code: string = req.query.code;
      const stateStr: string = req.query.state;
      const owner: string = stateStr.split('-')[0];
      const state: string = stateStr.split('-')[1];

      if (state !== verification) {
        res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Suspicious activity detected :O' });
      }
      const settings: ISettings = await this.settingsService.getSettingsBySpace(owner, param.space);
      return this.spaceRequestService.getToken(settings, { res, req, code });
    }

    redisClient.get(`${param.space}_${req.query.oauth_token}`, async (error, result) => {
      if (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
      }

      const savedSession = JSON.parse(result);
      req.session.oauthRequestToken = savedSession.oauthRequestToken;
      req.session.oauthRequestTokenSecret = savedSession.oauthRequestTokenSecret;

      const settings = savedSession.settings;
      // todo: move to oauth service
      this.consumer.getOAuthAccessToken(
        req.session.oauthRequestToken,
        req.session.oauthRequestTokenSecret,
        req.query.oauth_verifier,
        async (error: Object, oauthAccessToken: string, oauthAccessTokenSecret: string, results: Object) => {
          if (error) {
            res.status(HttpStatus.UNAUTHORIZED).json({ error, results });
          } else {
            const oauth = {
              oauthAccessToken,
              oauthAccessTokenSecret,
            };

            const token: Partial<TokenDto> = {
              oauth,
              owner: settings.owner,
              space: settings.space,
              access_token: oauthAccessToken,
              username: req.query.oauth_verifier,
            };

            await this.spaceRequestService.tokenService
              .register(token as TokenDto, settings)
              .then(token => {
                redisClient.del(`${param.space}_${req.query.oauth_token}`);
                res.status(HttpStatus.OK).send({ token });
              })
              .catch(error => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error }));
          }
        },
      );
    });
  }

  // @Put('profile/:space')
  // @UseGuards(AuthGuard('jwt'))
  // async fetchProfile(@Param() param, @Query() query, @Response() res, @Req() req) {
  //   let profile = await this.spaceRequest(param, query, res, req).then(({ body }) => body);
  //   if (this.spacesV1.some(source => source === param.space)) {
  //     profile = profile.data;
  //   }
  //   return await this.spaceService.updateProfile(param.space, req.user.username, profile).then(space => res.status(HttpStatus.OK).json(space));
  // }
}
