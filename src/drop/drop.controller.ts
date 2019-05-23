import * as schedule from 'node-schedule';
import * as moment from 'moment';
import { Controller, Get, UseGuards, HttpStatus, Response, Param, Req, Query, Body, Post, Put } from '@nestjs/common';
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
import { DropSetDto } from './dto/drops.dto';
import { IDropSet } from './interfaces/drop-set.schema';

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

  @Put(':space/set')
  @UseGuards(AuthGuard('jwt'))
  async updateDropSet(@Param() param, @Req() req, @Response() res, @Body() dropSetDto: DropSetDto) {
    const settings: ISettings = req.user.settings.find(({ space }) => space === param.space);
    return await this.dropService.upsertDropSet(param.space, settings.owner, dropSetDto).then(dropSet => {
      if (!dropSet) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No drop set for ${req.user.username}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(dropSet);
      }
    });
  }

  @Post(':space/set')
  @UseGuards(AuthGuard('jwt'))
  async addDropSet(@Param() param, @Req() req, @Response() res, @Body() dropSetDto: DropSetDto) {
    const settings: ISettings = req.user.settings.find(({ space }) => space === param.space);
    return await this.dropService.createDropSet(param.space, settings.owner, dropSetDto).then(dropSet => {
      if (!dropSet || dropSet.errors) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `Error creating ${param.space} drop set for  ${req.user.username}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(dropSet);
      }
    });
  }

  // todo: extract to mini controller for fetching only
  @Get('fetch/:space')
  @UseGuards(AuthGuard('jwt'))
  async fetchDrops(@Param() param, @Query() query, presets = {} as ISettings, @Req() req?, @Response() res?, @Query('type') type?) {
    query.consumed = true;
    const settings: ISettings = !!req ? req.user.settings.find(({ space }) => space === param.space) : presets;
    let navigation = {};
    let body = {};

    await this.dropService
      .getDropSet({ type, space: param.space, owner: settings.owner })
      .then((dropSet: IDropSet) => {
        //todo put this in a service
        if (!dropSet) return;

        body = dropSet.request || null;
        query.endpoint = dropSet.endpoint;

        switch (param.space) {
          case Sources.Spotify:
            query.endpoint += `?after=${dropSet.navigation.after}`;
            break;
          case Sources.GoogleApi:
            body =
              type !== 'location'
                ? { ...body, startTimeMillis: dropSet.navigation.after + 86400000, endTimeMillis: dropSet.navigation.before + 86400000 }
                : null;
            break;
          default:
            break;
        }
      })
      .catch(err => err);

    // fetch drops
    let drops: IDropItem[] = await this.spaceRequestService
      .fetchHandler(settings, query, res, body)
      .then(response => {
        const responsePath = `${param.space}${type === 'default' ? '' : '_' + type}`;
        let items = response[ResponseItemsPath[responsePath]];

        const hasError: boolean =
          (response.status && response.status !== HttpStatus.OK) ||
          !!JSON.stringify(response)
            .toLowerCase()
            .includes('error');

        if (hasError || !items) return;

        if (param.space === Sources.GoogleApi) {
          items =
            type === 'location'
              ? this.datasetService.convertLocations(param.space, items)
              : Array.prototype.concat
                  .apply([], items.map(bucket => Array.prototype.concat.apply([], bucket.dataset.map(({ point }) => point))))
                  .map(someDrop => ({ ...someDrop, value: someDrop.value[0] }));
        } else {
          items = this.datasetService.convertDatesToIso(param.space, items);
        }

        Object.assign(navigation, this.datasetService.getCursors(param.space, items));
        return items as IDropItem[];
      })
      .catch(err => err);

    let updatedDropSet;
    if (!!drops) {
      // map keys to dropSet, add all attributes from drops
      const dropKeys = this.datasetService.mapDropKeys(param.space, drops);
      this.dropService.upsertDropSet(param.space, settings.owner, { keys: dropKeys.mappedKeys }, type);
      this.attributeService.addAttributes(this.datasetService.mapDropAttributes(param.space, drops, dropKeys.arrayKeys));

      // save the drops and add them to their drop set
      drops = this.datasetService.identifyDrops(param.space, settings.owner, drops);
      updatedDropSet = await this.dropService.addDrops(param.space, settings.owner, drops, navigation, type).then(dropSet => dropSet);
    } else {
      updatedDropSet = { message: `No new drops for ${param.space}.` };
    }

    // return the saved drop set
    return !!res ? res.status(HttpStatus.OK).json(updatedDropSet) : null;
  }
}
