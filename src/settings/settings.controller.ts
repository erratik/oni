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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { ApiUseTags } from '@nestjs/swagger';
import { SettingsDto } from './dto/settings.dto';
import { UserService } from '../user/user.service';
import { CredentialsDto } from './dto/credentials.dto';
import { IUser } from '../user/interfaces/user.schema';
import { ISettings, ICredentials } from './interfaces/settings.schema';
import { settings } from 'cluster';

@ApiUseTags('settings')
@Controller('v1/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService, private readonly userService: UserService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createSpace(@Response() res, @Req() req, @Body() settingsDto: SettingsDto) {
    const token = req.headers.authorization.replace('Bearer ', '');
    const user: IUser = await this.userService.getUserByToken(token);
    return await this.settingsService
      .create(settingsDto, user.username)
      .then(space => res.status(HttpStatus.OK).json(space))
      .catch(err => res.send(err));
  }

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  async getSettings(@Response() res, @Query() query?, @Body() body?) {
    const fetchSettings =
      !!query && !!query.search ? this.settingsService.getSettings(body) : this.settingsService.findAll();
    return await fetchSettings.then(settings => {
      if (!settings) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'No settings',
        });
      } else {
        return res.status(HttpStatus.OK).json(settings);
      }
    });
  }

  @Get(':space')
  @UseGuards(AuthGuard('jwt'))
  async getSetting(@Param() param, @Response() res) {
    return await this.settingsService.getSettingsBySpace(param.space).then(settings => {
      if (!settings) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No settings found for ${param.space}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(settings);
      }
    });
  }

  @Put('credentials/:space')
  @UseGuards(AuthGuard('jwt'))
  async updateSettings(
    @Param() params,
    @Req() req,
    @Response() res,
    @Query() query,
    @Body() credentialsDto: CredentialsDto
  ) {
    const token = req.headers.authorization.replace('Bearer ', '');
    const user: IUser = await this.userService.getUserByToken(token);
    const settings: ISettings = await this.settingsService.getSettingsBySpace(params.space);

    // todo: throw error if updating wrong user/owner

    if (!settings) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `No settings found for ${params.space}`,
      });
    }

    if (!!settings.credentials.length) {
      // Object.keys(credentialsDto).forEach(credentialKey => {
      settings.credentials = settings.credentials.map(credential => {
        if (credential.scope === query.scope) {
          credential.clientId = credentialsDto.clientId;
          credential.clientSecret = credentialsDto.clientSecret;
          credential.callbackUrl = credentialsDto.callbackUrl;
          credential.updatedAt = new Date();
        }
        return credential;
      });
      // });
    } else {
      settings.space = params.space;
      settings.credentials.push({
        clientId: credentialsDto.clientId,
        clientSecret: credentialsDto.clientSecret,
        callbackUrl: credentialsDto.callbackUrl,
        updatedAt: new Date(),
        scope: query.scope,
      } as ICredentials);
    }

    debugger;
    return await this.settingsService
      .updateCredentials(params.space, user.username, settings)
      .then(settings => res.status(HttpStatus.OK).json(settings))
      .catch(err => res.send(err));
  }

  @Delete('delete')
  @UseGuards(AuthGuard('jwt'))
  async deleteSettings(@Response() res, @Body() settingsDto: SettingsDto) {
    return await this.settingsService
      .delete(settingsDto)
      .then(settings => res.status(HttpStatus.OK).json(settings))
      .catch(err => res.send(err));
  }

  @Delete('delete/credentials')
  @UseGuards(AuthGuard('jwt'))
  async deleteCredentials(@Req() req, @Response() res, @Body() settingsDto: SettingsDto) {
    const token = req.headers.authorization.replace('Bearer ', '');
    const user: IUser = await this.userService.getUserByToken(token);
    const settings: ISettings = await this.settingsService.getSettingsBySpace(settingsDto.space);

    if (!settings) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `No settings found for ${settingsDto.space}`,
      });
      return;
    } else if (!settings.credentials) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `No ${settingsDto.scope} credentials found in ${settingsDto.space}`,
      });
      return;
    }

    settings.credentials = settings.credentials.filter(credential => credential.scope !== settingsDto.scope);

    debugger;
    return await this.settingsService
      .updateCredentials(settingsDto.space, user.username, settings)
      .then(settings => res.status(HttpStatus.OK).json(settings))
      .catch(err => res.send(err));
  }

  // @Get('connect/:settingsName')
  // @UseGuards(AuthGuard('spotify'))
  // async connectUserToSettings(@Param() param, @Response() res, @Req() req) {
  //   // get user through authorization bearer token
  //   const token = req.headers.authorization.replace('Bearer ', '');
  //   const user = await this.userService.getUserByToken(token);

  //   //connect to settings

  //   //retrieve token && save it
  //   return res.status(HttpStatus.OK).json({ user });
  //   // return await this.settingsService.getSettingsByName(param.settingsName).then(settings => {
  //   //   if (!settings) {
  //   //     res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //   //       message: `Failed to get a token from ${param.settingsName}`,
  //   //     });
  //   //   } else {
  //   //     return res.status(HttpStatus.OK).json(settings);
  //   //   }
  //   // });
  // }
}
