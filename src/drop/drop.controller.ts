import * as schedule from 'node-schedule';
import * as moment from 'moment';
import { Controller, Get, UseGuards, HttpStatus, Response, Param, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DropService } from './drop.service';
import { ApiUseTags } from '@nestjs/swagger';
import { ConfigService } from '../config/config.service';
import { ISettings } from '../settings/interfaces/settings.schema';
import { SpaceRequestService } from '../space/space-request.service';
import { IDropItem } from './interfaces/drop-item.schema';
import { ResponseItemsPath } from './drop.constants';
import { DropManipulatorService } from './drop-manipulation.service';
import { SettingsService } from '../settings/settings.service';
import { AttributeService } from '../attributes/attributes.service';

@ApiUseTags('drops')
@Controller('v1/drops')
export class DropController {
  public runSchedules = {
    spotify: null,
  };
  public settings;
  constructor(
    private configService: ConfigService,
    private readonly dropService: DropService,
    private readonly settingsService: SettingsService,
    private readonly manipulatorService: DropManipulatorService,
    private readonly attributeService: AttributeService,
    private readonly spaceRequestService: SpaceRequestService
  ) {
    const that = this;
    (async () => {
      that.settings = await that.settingsService.getSettings({}).then(someSettings => {
        // setup schedules for each user and space
        someSettings.forEach(settings => {
          that.runSchedules[settings.space] = schedule.scheduleJob(settings.cron, function() {
            that.fetchDrops({ space: settings.space }, {}, settings).catch(error => console.log(error));
            console.log(`⏲ Schedule ran for ${settings.space}, next run will be at ${moment(this.nextInvocation(), 'llll').local(true)}`);
          });
        });
      });
    })();
  }

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
  async fetchDrops(@Param() param, @Query() query, presets = {} as ISettings, @Req() req?, @Response() res?) {
    query.consumed = true;
    const settings: ISettings = !!req ? req.user.settings.find(({ space }) => space === param.space) : presets;
    const navigation = {};

    await this.dropService.getDropSet({ space: param.space, owner: settings.owner }).then(dropSet => (query.endpoint = dropSet.endpoint));

    // fetch drops
    let items = await this.spaceRequestService.fetchHandler(settings, query, res).then(response => {
      // todo: handle cursor for response without
      Object.assign(navigation, { ...response.cursors, next: response.next });
      return this.manipulatorService.convertDatesToIso(response[ResponseItemsPath[param.space]]);
    });

    if (!!req) {
      // map keys to dropSet, add all attributes from drops
      const dropKeys = this.manipulatorService.mapDropKeys(items);
      await this.dropService.upsertDropSet(param.space, settings.owner, { keys: dropKeys.mappedKeys }).then(() => {
        this.attributeService.addAttributes(this.manipulatorService.mapDropAttributes(items, dropKeys.arrayKeys, param.space));
      });
    }

    const drops: IDropItem[] = this.manipulatorService.identifyDrops(param.space, settings.owner, items);

    // save the drops and add them to their drop set
    const updatedDropSet = await this.dropService.addDrops(param.space, settings.owner, drops, navigation).then(dropSet => dropSet);

    // return the saved drop set
    return !!res ? res.status(HttpStatus.OK).json(updatedDropSet) : null;
  }
}
