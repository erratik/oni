import { Controller, Get, UseGuards, HttpStatus, HttpService, Response, Param, Post, Body, Put, Delete, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenService } from './token.service';
import { ApiUseTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { SettingsService } from '../settings/settings.service';
import { Sources } from '../app.constants';
import { ConfigService } from '../config/config.service';
import { ISettings } from '../settings/interfaces/settings.schema';
import { TokenDto } from './dto/token.dto';

@ApiUseTags('token')
@Controller('v1/token')
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService // public http: HttpService
  ) {}

  @Post('')
  @UseGuards(AuthGuard('jwt'))
  async createToken(@Req() req, @Response() res, @Body() tokenDto: TokenDto) {
    return await this.tokenService.register({ ...tokenDto, owner: req.user.username }, req.user.settings).then(token => res.status(HttpStatus.OK).json(token));
  }

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  async getTokens(@Req() req, @Response() res) {
    return await this.tokenService.findAll({ owner: req.user.username }).then(tokens => {
      if (!tokens) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'No tokens',
        });
      } else {
        return res.status(HttpStatus.OK).json(tokens);
      }
    });
  }

  @Get(':space')
  @UseGuards(AuthGuard('jwt'))
  async getToken(@Param() params, @Req() req, @Response() res) {
    return await this.tokenService.getTokenBySpace(req.user.username, params.space).then(token => {
      if (!token) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No ${params.space} tokens for ${req.user.username}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(token);
      }
    });
  }
}
