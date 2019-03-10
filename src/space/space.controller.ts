import { Controller, Get, UseGuards, HttpStatus, Response, Param, Post, Body, Put, Delete, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SpaceService } from './space.service';
import { ApiUseTags } from '@nestjs/swagger';
import { SpaceDto } from './dto/space.dto';
import { UserService } from '../user/user.service';
import { SettingsService } from '../settings/settings.service';

@ApiUseTags('spaces')
@Controller('v1/spaces')
export class SpaceController {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly userService: UserService,
    private readonly settingsService: SettingsService
  ) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createSpace(@Response() res, @Body() spaceDto: SpaceDto) {
    return await this.spaceService.create(spaceDto).then(space => res.status(HttpStatus.OK).json(space));
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

  @Get(':spaceName')
  @UseGuards(AuthGuard('jwt'))
  async getSpace(@Param() params, @Response() res) {
    return await this.spaceService.getSpaceByName(params.spaceName).then(space => {
      if (!space) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No space found for ${params.spaceName}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(space);
      }
    });
  }

  @Put('update')
  @UseGuards(AuthGuard('jwt'))
  async updateSpace(@Response() res, @Body() spaceDto: SpaceDto) {
    return await this.spaceService.update(spaceDto).then(space => res.status(HttpStatus.OK).json(space));
  }

  @Delete('delete')
  @UseGuards(AuthGuard('jwt'))
  async deleteSpace(@Response() res, @Body() spaceDto: SpaceDto) {
    return await this.spaceService.delete(spaceDto).then(space => res.status(HttpStatus.OK).json(space));
  }

  @Get('connect/:spaceName')
  @UseGuards(AuthGuard('jwt'))
  async connectUserToSpace(@Param() params, @Response() res, @Req() req) {
    // get user through authorization bearer token
    const token = req.headers.authorization.replace('Bearer ', '');
    let userHasAuth = false;

    const info = await Promise.all([
      this.userService.getUserByToken(token),
      this.settingsService.getSettings(params),
    ]).then(([user, settings]) => {
      debugger;
      //check if user has auth

      return [user, settings];
    });
    // const user = await this.userService.getUserByToken(params.spaceName).then(user => {
    //   console.log(user);
    // });

    // settings = await this.settingsService.getSettingsBySpace(params.spaceName);
    //connect to space

    //retrieve token && save it

    return res.status(HttpStatus.OK).json({ info });
    // return await this.spaceService.getSpaceByName(param.spaceName).then(space => {
    //   if (!space) {
    //     res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    //       message: `Failed to get a token from ${param.spaceName}`,
    //     });
    //   } else {
    //     return res.status(HttpStatus.OK).json(space);
    //   }
    // });
  }
}
