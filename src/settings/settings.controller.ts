import { Controller, Get, UseGuards, HttpStatus, Response, Param, Post, Body, Put, Delete, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { ApiUseTags } from '@nestjs/swagger';
import { SettingsDto } from './dto/settings.dto';
import { ISettings } from './interfaces/settings.schema';
import { LoggerService } from '../shared/services/logger.service';

@ApiUseTags('settings')
@Controller('v1/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService, public logger: LoggerService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createSpaceSettings(@Response() res, @Req() req, @Body() settingsDto: SettingsDto) {
    return await this.settingsService
      .create(settingsDto, req.user.username)
      .then(space => res.status(HttpStatus.OK).json(space))
      .catch(err => res.send(err));
  }

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  async getSettings(@Response() res, @Query() query?, @Body() body?) {
    const fetchSettings = !!query && !!query.search ? this.settingsService.getSettings(body) : this.settingsService.findAll();
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
  async getSetting(@Param() param, @Req() req, @Response() res) {
    return await this.settingsService.getSettingsBySpace(req.user.username, param.space).then(settings => {
      if (!settings) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No settings found for ${param.space}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(settings);
      }
    });
  }

  @Put(':space')
  @UseGuards(AuthGuard('jwt'))
  async updateSettings(@Param() param, @Req() req, @Response() res, @Body() settingsDto: SettingsDto) {
    let settings: ISettings = req.user.settings.find(({ space }) => space === param.space);

    // todo: throw error if updating wrong user/owner

    if (!settings) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `No settings found for ${param.space}`,
      });
    } else {
      settings = Object.assign(settings, settingsDto);
    }

    return await this.settingsService
      .update(req.user.username, param.space, settings)
      .then(settings => res.status(HttpStatus.OK).json(settings))
      .catch(err => res.send(err));
  }

  @Delete(':owner')
  @UseGuards(AuthGuard('jwt'))
  async deleteSettings(@Param() param, @Response() res) {
    return await this.settingsService
      .delete(param.owner, param.space)
      .then(settings => res.status(HttpStatus.OK).json(settings))
      .catch(err => res.send(err));
  }

  @Delete(':space/:key')
  @UseGuards(AuthGuard('jwt'))
  async deleteSettingsKey(@Param() param, @Req() req, @Response() res) {
    const settings: ISettings = req.user.settings;

    if (!settings) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `No ${param.space} settings found for ${req.user.username}`,
      });
      return;
    } else if (!settings.credentials) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `No ${param.space} ${param.key} found for ${req.user.username}`,
      });
      return;
    }

    delete settings[param.key];

    return await this.settingsService
      .update(req.user.username, param.space, settings)
      .then(settings => {
        debugger;
        return res.status(HttpStatus.OK).json(settings);
      })
      .catch(err => res.send(err));
  }
}
