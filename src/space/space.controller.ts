import { Controller, Get, UseGuards, HttpStatus, HttpService, Response, Param, Post, Body, Put, Delete, Req, Query } from '@nestjs/common';
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

@ApiUseTags('spaces')
@Controller('v1/spaces')
export class SpaceController {
  public spacesV1: string[] = [];

  constructor(
    private readonly spaceService: SpaceService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    private readonly spaceRequestService: SpaceRequestService,
    public http: HttpService
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
      .catch(err => {
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
  async spaceRequest(@Param() param, @Query() query, @Response() res, @Req() req, @Body() body?) {
    const settings: ISettings = req.user.settings.find(({ space }) => space === param.space);
    query.consumed = false;
    return this.spaceRequestService.fetchHandler(settings, query, res, body);
  }

  @Get('connect/:space')
  @UseGuards(AuthGuard('jwt'))
  async connectSpace(@Param() param, @Response() res, @Req() req) {
    const config: IConfig = this.configService.config;
    const settings: ISettings = req.user.settings.find(({ space }) => space === param.space);

    let urlParams: any = {
      client_id: settings.credentials.clientId,
      state: `${settings.owner}-${config.spaceState}-${settings.credentials.grantorUrl}`,
      scope: settings.credentials.scopes,
      redirect_uri: `${config.baseUrl}/spaces/callback/${param.space}`,
      response_type: 'code',
    };

    if (param.space === Sources.GoogleApi) {
      urlParams.include_granted_scopes = 'true';
      urlParams.access_type = 'offline';
    }

    res.set('Authorization', '');
    return res.redirect(HttpStatus.TEMPORARY_REDIRECT, this.spaceRequestService.composeUrl(settings.authorization.url, urlParams));
  }

  @Get('callback/:space')
  async spaceCallback(@Param() param, @Response() res, @Req() req) {
    if (!!req.query.error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: req.query.error });
    }
    const config = this.configService.config;
    const verification: string = config.spaceState;

    const code: string = req.query.code;
    const stateStr: string = req.query.state;
    const owner: string = stateStr.split('-')[0];
    const state: string = stateStr.split('-')[1];

    if (state !== verification) {
      res.status(HttpStatus.UNAUTHORIZED).json({ error: `Suspicious activity detected :O` });
    }

    const settings = await this.settingsService.getSettingsBySpace(owner, param.space);

    await this.spaceRequestService
      .getToken(settings, code)
      .then(token => {
        if (!token.error) {
          return res.status(HttpStatus.OK).json({ message: `Successfully saved ${param.space} token info for ${owner}`, response: token });
        } else {
          throw token.error;
        }
      })
      .catch(err => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err));
  }

  @Put('profile/:space')
  @UseGuards(AuthGuard('jwt'))
  async fetchProfile(@Param() param, @Query() query, @Response() res, @Req() req) {
    let profile = await this.spaceRequest(param, query, res, req).then(({ body }) => body);
    if (this.spacesV1.some(source => source === param.space)) {
      profile = profile.data;
    }
    return await this.spaceService.updateProfile(param.space, req.user.username, profile).then(space => res.status(HttpStatus.OK).json(space));
  }
}
