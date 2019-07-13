import * as schedule from 'node-schedule';
import * as moment from 'moment';
import { Controller, Get, UseGuards, HttpStatus, Response as Res, Param, Req, Query, Body, Post, Put, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DropService } from './drop.service';
import { ApiUseTags } from '@nestjs/swagger';
import { ISettings } from '../settings/interfaces/settings.schema';
import { SpaceRequestService } from '../space/space-request.service';
import { IDropItem } from './interfaces/drop-item.schema';
import { ResponseItemsPath, TimestampDelta, DropType } from './drop.constants';
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
  public runSchedules = {};
  public settings: ISettings[];
  constructor(
    private readonly dropService: DropService,
    private readonly settingsService: SettingsService,
    private readonly dropSchemaService: DropSchemaService,
    private readonly datasetService: DatasetService,
    private readonly attributeService: AttributeService,
    private readonly spaceRequestService: SpaceRequestService,
  ) {
    const that = this;
    (async () => {
      const dropsSets: IDropSet[] = await this.dropService.getDropSets();
      await that.settingsService.getSettings({}).then(settings => {
        dropsSets.forEach(dropSet => {
          const spaceSettings: ISettings = settings.find(({ space }) => space === dropSet.space);
          const crontab = dropSet.cron || spaceSettings.cron;
          console.log(`⏲  ${dropSet.space} (${dropSet.type}) crontab:`, crontab);
          that.runSchedules[`${dropSet.space}_${dropSet.type}`] = schedule.scheduleJob(crontab, function () {
            that
              .fetchDrops({ space: dropSet.space }, {}, spaceSettings, null, null, dropSet.type)
              .then(data => {
                // if (!!data.stats && !!data.stats.addedDrops) {
                //   console.log(`⏲  Schedule ran for ${dropSet.space}_${dropSet.type}`);

                //   data.stats.addedDrops = data.stats.addedDrops.length;
                // }
                // console.log(data.stats);
                console.log(`⏲  Next ${dropSet.space} run will be at ${moment(this.nextInvocation(), 'llll').local(true)}`);
              })
              .catch(error => console.log(error));
          });
        });
      });
    })();
  }

  @Get(':space')
  @UseGuards(AuthGuard('jwt'))
  async getDropsBySpace(@Param() param, @Req() req, @Res() res): Promise<IDropItem[]> {
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
  async getOneDrop(@Param() param, @Req() req, @Res() res, @Query('type') type, @Body() moreFields) {
    const sorter = {};
    sorter[TimestampDelta[param.space]] = -1;
    return await this.dropService.getDrop({ space: param.space, owner: req.user.username, ...moreFields }, sorter).then(async drop => {
      if (!drop) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No drop found with query: ${JSON.stringify(moreFields)}`,
        });
      } else {
        await this.dropSchemaService
          .getDropSchema({ space: param.space, owner: req.user.username, type: type || DropType.Default })
          .then(schema => (drop = this.datasetService.buildDropWithSchema(param.space, drop, schema)));

        return res.status(HttpStatus.OK).json(drop);
      }
    });
  }

  @Get(':space/items')
  @UseGuards(AuthGuard('jwt'))
  async getSomeDrops(@Param() param, @Req() req, @Res() res, @Query('schema') type, @Query('limit') limit: number, @Body() query) {
    const sorter = {};
    sorter[TimestampDelta[param.space]] = -1;
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

  @Get('sets/all')
  @UseGuards(AuthGuard('jwt'))
  async getDropSets(@Req() req, @Res() res, @Query() query = {}) {
    return await this.dropService.getDropSets(query).then(dropSets => {
      if (!dropSets) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No drop sets for ${req.user.username}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(dropSets);
      }
    });
  }

  @Get(':space/set')
  @UseGuards(AuthGuard('jwt'))
  async getDropSet(@Param() param, @Req() req, @Res() res, @Query() query) {
    // todo: what if i want to query only some drops in the set... or project a specifc key?
    if (param.space === 'all') {
      delete param.space;
    }

    query = Object.assign(query, param);
    query.owner = req.user.username;
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
  async updateDropSet(@Param() param, @Req() req, @Res() res, @Body() dropSetDto: DropSetDto) {
    const settings: ISettings = req.user.settings.find(({ space }) => space === param.space);
    return await this.dropService
      .upsertDropSet(param.space, settings.owner, dropSetDto)
      .then(dropSet => res.status(HttpStatus.OK).json(dropSet))
      .catch(error => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error, message: `[DropController] No drop set for ${req.user.username}` }));
  }

  @Post(':space/set')
  @UseGuards(AuthGuard('jwt'))
  async addDropSet(@Param() param, @Req() req, @Res() res, @Body() dropSetDto: DropSetDto) {
    const settings: ISettings = req.user.settings.find(({ space }) => space === param.space);
    return await this.dropService
      .createDropSet(param.space, settings.owner, dropSetDto)
      .then(dropSet => res.status(HttpStatus.OK).json(dropSet))
      .catch(error =>
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ error, message: `[DropController] Error creating ${param.space} drop set for  ${req.user.username}` }),
      );
  }

  // todo: extract to mini controller for fetching only
  @Get('fetch/:space')
  @UseGuards(AuthGuard('jwt'))
  async fetchDrops(@Param() param, @Query() query, presets = {} as ISettings, @Req() req?, @Res() res?, @Query('type') type?) {
    query.consumed = true;
    type = type || DropType.Default;

    const settings: ISettings = !!req ? req.user.settings.find(({ space }) => space === param.space) : presets;

    const dropSet = await this.dropService.getDropSet({ type, space: param.space, owner: settings.owner }).then((dropSet: IDropSet) => dropSet);

    if (!dropSet) {
      try {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No ${type} drop set found for ${req.user.username}`,
        });
        return;
      } catch (e) {
        return e;
      }
    }

    // todo: move this to spreadsheet drop functionality
    const isSpreadSheetFetch: boolean = dropSet.endpoint.includes('spreadsheets');

    const finish = async (drops?: IDropItem[]) => {
      // todo: move this to spreadsheet drop functionality

      let updatedDropSet: Object | IDropSet;
      if (!!drops && drops.length) {
        // ? map keys to dropSet, add all attributes from drops
        const dropKeys = this.datasetService.mapDropKeys(param.space, drops);
        this.dropService.upsertDropSet(param.space, settings.owner, { keys: dropKeys.mappedKeys, navigation: dropSet.navigation }, type);
        this.attributeService.addAttributes(this.datasetService.mapDropAttributes(param.space, drops, dropKeys.arrayKeys));

        // ? save the drops and add them to their drop set
        drops = this.datasetService.identifyDrops(param.space, settings.owner, drops, type);
        updatedDropSet = await this.dropService.addDrops(param.space, settings.owner, drops, type).then(dropSet => dropSet);

        // todo: move this to spreadsheet drop functionality
        // todo: document how this works, callbacks for requests - housekeeping
        if (isSpreadSheetFetch) {
          // const callbackRequest: any = query.endpoint.includes('spreadsheets') ? dropSetRetrieved.request : null;
          // body = { requests: [callbackRequest] };
          query.endpoint = `${query.endpoint.split('/values')[0]}:batchUpdate`;
          query.type = 'post';
          await this.spaceRequestService
            .fetchHandler(settings, { query, res, body: dropSet.body })
            // .then(this.spaceRequestService.validateRequest)
            .then(result => {
              // if (!!result.ok && !result.ok) {
              // debugger;
              return !!res ? res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result) : updatedDropSet;
              // }
            });
        }
      } else {
        updatedDropSet = { message: `No new drops for ${param.space}.` };
      }

      // return the saved drop set
      return param.space === Sources.Twitter ? res.status(HttpStatus.OK).json(updatedDropSet) : updatedDropSet;
    };

    // fetch drops
    await this.spaceRequestService
      .fetchHandler(settings, { res, req, body: dropSet.body, query: { ...dropSet, ...query }, done: finish })
      // .then(this.spaceRequestService.validateRequest)
      .then(response => {
        if (param.space !== Sources.Twitter) {
          // debugger;
          return !!res ? res.status(HttpStatus.OK).json(response) : response;
        }
      });

    // finish(drops);
  }
}
