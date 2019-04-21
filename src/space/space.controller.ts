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

@ApiUseTags('spaces')
@Controller('v1/spaces')
export class SpaceController {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    private readonly spaceRequestService: SpaceRequestService,
    public http: HttpService
  ) {}

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
    return await this.spaceService.update({ ...spaceDto, owner: req.user.username }).then(space => res.status(HttpStatus.OK).json(space));
  }

  @Delete('delete')
  @UseGuards(AuthGuard('jwt'))
  async deleteSpace(@Req() req, @Response() res, @Body() spaceDto: SpaceDto) {
    return await this.spaceService.delete({ ...spaceDto, owner: req.user.username }).then(space => res.status(HttpStatus.OK).json(space));
  }

  @Get('connect/:space')
  @UseGuards(AuthGuard('jwt'))
  async connectSpace(@Param() param, @Response() res, @Req() req) {
    const config: IConfig = this.configService.config;
    const settings: ISettings = req.user.settings.find(({ space }) => space === param.space);

    return res.redirect(
      HttpStatus.TEMPORARY_REDIRECT,
      this.spaceRequestService.composeUrl(settings.authorization.url, {
        client_id: settings.credentials.clientId,
        state: `${settings.owner}-${config.spaceState}-${settings.credentials.grantorUrl}`,
        scope: settings.credentials.scopes,
        redirect_uri: `${config.baseUrl}/spaces/callback/${param.space}`,
        response_type: 'code',
      })
    );
  }

  @Get('callback/:space')
  async spaceCallback(@Param() param, @Response() res, @Req() req) {
    if (!!req.query.error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: req.query.error });
    }

    const config = this.configService.config;
    const code: string = req.query.code;
    const stateStr: string = req.query.state;
    const owner: string = stateStr.split('-')[0];
    const state: string = stateStr.split('-')[1];
    const verification: string = config.spaceState;

    if (state !== verification) {
      res.status(HttpStatus.UNAUTHORIZED).json({ error: `Suspicious activity detected :O` });
    }

    const settings = await this.settingsService.getSettingsBySpace(owner, param.space);
    const options = {
      client_id: settings.credentials.clientId,
      client_secret: settings.credentials.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: `${config.baseUrl}/spaces/callback/${param.space}`,
      code,
    };
    const url = this.spaceRequestService.composeUrl(stateStr.split('-')[2], options);

    await this.spaceRequestService
      .getToken(settings, options)
      .then(token => res.status(HttpStatus.OK).json({ message: `Successfully saved ${param.space} token info for ${owner}`, response: token }))
      .catch(err => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err));
  }

  @Get('fetch/:space')
  @UseGuards(AuthGuard('jwt'))
  async spaceRequest(@Param() param, @Query() query, @Response() res, @Req() req) {
    const settings: ISettings = req.user.settings.find(({ space }) => space === param.space);
    if (!settings) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `No ${param.space} settings for found for ${req.user.username}` });
    }

    const token = settings.authorization.info;
    if (!token) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `No ${param.space} token for ${req.user.username}` });
    }

    const url = settings.baseUrl + query.endpoint;
    const isTokenExpired = new Date().valueOf() >= token.updatedAt.valueOf() + token.expires_in * 1000;

    if (isTokenExpired && !!token.refresh_token) {
      return await this.spaceRequestService.refreshToken(settings, url).catch(err => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err));
    } else {
      return await this.spaceRequestService
        .getData(settings, url)
        .then(({ body }) => res.status(HttpStatus.OK).json(body))
        .catch(err => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err));
    }
  }
}
