import { Controller, Get, UseGuards, HttpStatus, Response, Param, Post, Body, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DropService } from './drop.service';
import { ApiUseTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { ConfigService } from '../config/config.service';
import { ISettings } from '../settings/interfaces/settings.schema';
import { SpaceRequestService } from '../space/space-request.service';
import { ResponseItemsPath as xPath } from './drop.constants';
import { DropSchemaDto } from './dto/drops.dto';
import { IDropSet } from './interfaces/drop-set.schema';
import { IDropItem } from './interfaces/drop-item.schema';
import { Sources } from '../app.constants';
import * as btoa from 'btoa';

@ApiUseTags('drops')
@Controller('v1/drops')
export class DropController {
  constructor(private readonly dropService: DropService, private readonly spaceRequestService: SpaceRequestService) {}

  @Get(':space')
  @UseGuards(AuthGuard('jwt'))
  async getDropsBySpace(@Param() param, @Req() req, @Response() res): Promise<IDropItem[]> {
    return await this.dropService.getDropsBySpace({ owner: req.user.username, space: param.space }).then(dropItems => {
      if (!dropItems) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No ${param.space} drops for ${req.user.username}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(dropItems);
      }
    });
  }

  @Get('set/:space')
  @UseGuards(AuthGuard('jwt'))
  async getDropSet(@Param() param, @Req() req, @Response() res, @Query() query) {
    // todo: what if i want to query only some drops in the set... or project a specifc key?
    if (param.space === 'all') {
      delete param.space;
    }
    query = Object.assign(query, param);
    return await this.dropService.getDropSet(query).then(dropSet => {
      if (!dropSet) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No drop set for ${req.user.username}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(dropSet);
      }
    });
  }

  @Get('fetch/:space')
  @UseGuards(AuthGuard('jwt'))
  async fetchDrops(@Param() param, @Req() req, @Response() res, @Query() query) {
    const settings: ISettings = req.user.settings.find(({ space }) => space === param.space);

    // fetch drops
    query.consumed = true;
    const response = await this.spaceRequestService.fetchHandler(settings, query, res);

    // add fields
    const drops: IDropItem[] = response[xPath[param.space]].map((item: IDropItem) => {
      item.owner = req.user.username;
      item.space = param.space;

      if (!item.id) {
        switch (item.space) {
          case Sources.Spotify:
            item.id = item['track'].id;
            break;
          default:
            item.id = btoa(Math.random());
        }
      }
      return item;
    });

    // save the drops and add them to their drop set
    const updatedDropSet = await this.dropService.addDrops(drops).then(dropSet => dropSet);

    // return the saved drop set
    return res.status(HttpStatus.OK).json(updatedDropSet);
  }
}
