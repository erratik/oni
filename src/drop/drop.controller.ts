import * as schedule from 'node-schedule';
import * as moment from 'moment';
import { Controller, Get, UseGuards, HttpStatus, Response, Param, Req, Query, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DropService } from './drop.service';
import { ApiUseTags } from '@nestjs/swagger';
import { ISettings } from '../settings/interfaces/settings.schema';
import { SpaceRequestService } from '../space/space-request.service';
import { IDropItem } from './interfaces/drop-item.schema';
import { ResponseItemsPath, TimestampField } from './drop.constants';
import { DatasetService } from '../shared/services/dataset.service';
import { SettingsService } from '../settings/settings.service';
import { AttributeService } from '../attributes/attributes.service';
import { Sources } from '../app.constants';
import { DropSchemaService } from '../drop-schemas/drop-schema.service';

@ApiUseTags('drops')
@Controller('v1/drops')
export class DropController {
  public runSchedules = {
    spotify: null,
  };
  public settings;
  constructor(
    private readonly dropService: DropService,
    private readonly settingsService: SettingsService,
    private readonly dropSchemaService: DropSchemaService,
    private readonly datasetService: DatasetService,
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
            console.log(`⏲  Schedule ran for ${settings.space}, next run will be at ${moment(this.nextInvocation(), 'llll').local(true)}`);
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

  @Get(':space/item')
  @UseGuards(AuthGuard('jwt'))
  async getOneDrop(@Param() param, @Req() req, @Response() res, @Query('schema') type, @Body() query) {
    let sorter = {};
    sorter[TimestampField[param.space]] = -1;
    return await this.dropService.getDrop({ ...query, space: param.space, owner: req.user.username }, sorter).then(async drop => {
      if (!drop) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No drop found with query: ${JSON.stringify(query)}`,
        });
      } else {
        if (type) {
          await this.dropSchemaService.getDropSchema({ space: param.space, owner: req.user.username, type }).then(schema => {
            drop = this.datasetService.buildDropWithSchema(param.space, drop, schema);
          });
        }
        return res.status(HttpStatus.OK).json(drop);
      }
    });
  }

  @Get(':space/items')
  @UseGuards(AuthGuard('jwt'))
  async getSomeDrops(@Param() param, @Req() req, @Response() res, @Query('schema') type, @Query('limit') limit: number, @Body() query) {
    let sorter = {};
    sorter[TimestampField[param.space]] = -1;
    limit = Number(limit);
    return await this.dropService.getDrops({ space: param.space, owner: req.user.username }, limit, sorter).then(async drops => {
      if (!drops) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No drop found with query: ${JSON.stringify(query)}`,
        });
      } else {
        if (type) {
          await this.dropSchemaService.getDropSchema({ space: param.space, owner: req.user.username, type }).then(schema => {
            drops = drops.map(drop => this.datasetService.buildDropWithSchema(param.space, drop, schema));
          });
        }
        return res.status(HttpStatus.OK).json(drops);
      }
    });
  }

  @Get(':space/set')
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

    await this.dropService.getDropSet({ space: param.space, owner: settings.owner }).then(dropSet => {
      query.endpoint = dropSet.endpoint;
      if (param.space === Sources.Spotify) {
        query.endpoint += `?after=${dropSet.navigation.after}`;
      }
    });

    // fetch drops
    let items = await this.spaceRequestService.fetchHandler(settings, query, res).then(response => {
      let drops = response[ResponseItemsPath[param.space]];
      if (!drops) {
        return res ? res.status(HttpStatus.OK).json({ message: `No new drops for ${param.space}` }) : null;
      }
      drops = this.datasetService.convertDatesToIso(param.space, drops);
      Object.assign(navigation, this.datasetService.getCursors(param.space, drops));
      return drops;
    });

    let updatedDropSet;

    if (items) {
      // map keys to dropSet, add all attributes from drops
      const dropKeys = this.datasetService.mapDropKeys(param.space, items);
      await this.dropService.upsertDropSet(param.space, settings.owner, { keys: dropKeys.mappedKeys }).then(() => {
        this.attributeService.addAttributes(this.datasetService.mapDropAttributes(param.space, items, dropKeys.arrayKeys));
      });

      // save the drops and add them to their drop set
      updatedDropSet = await this.dropService
        .addDrops(param.space, settings.owner, this.datasetService.identifyDrops(param.space, settings.owner, items), navigation)
        .then(dropSet => dropSet);
    } else {
      updatedDropSet = { message: 'nothing to update' };
    }

    // return the saved drop set
    return !!res ? res.status(HttpStatus.OK).json(updatedDropSet) : null;
  }
}
