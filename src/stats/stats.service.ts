import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { InjectionTokens } from '../app.constants';
import { PassportLocalModel } from 'passport-local-mongoose';
import { StatsSchemaDto } from './dto/stats.dto';
import { IStatsService } from './interfaces/istats.service';
import { IStatsEntry } from './interfaces/stats.schema';
import { mongoQuerify } from '../shared/helpers/query.helpers';
import moment = require('moment');

@Injectable()
export class StatsService implements IStatsService {
  public constructor(@Inject(InjectionTokens.StatsModel) private readonly statsModel: PassportLocalModel<IStatsEntry>, public logger: LoggerService) {}

  public async getStats(query: any, sorter?: any): Promise<IStatsEntry[]> {
    this.logger.log('[StatsService]', 'Getting stats');

    const stats: IStatsEntry[] = await this.statsModel.find(mongoQuerify(query)).sort(sorter);
    return stats ? stats.map(item => ({ ...item.toObject() })) : null;
  }

  public async upsertStats(stats: StatsSchemaDto): Promise<StatsSchemaDto> {
    const { space, owner, error, inserted, type } = stats;
    this.logger.log('[StatsService]', `Upserting fetching stats for ${space} (${type}) for ${owner}`);

    stats.username = stats.owner + Date.now().toString();

    stats.status = error.hasOnlyDuplicates ? 'skipped' : inserted.wasPartial ? 'partial' : error.otherErrors.length + error.duplicates ? 'failed' : 'success';
    // const { before, after } = stats.range;
    // stats.range = {
    //   from: moment(before, null).isValid() ? new Date(before) : before,
    //   to: moment(after, null).isValid() ? new Date(after) : after,
    // };

    return this.statsModel
      .create(stats)
      .then((stats: IStatsEntry) => ({ ...(stats.toObject() as StatsSchemaDto) }))
      .catch(error => {
        throw error;
      });
  }

  //                                                                                                      //
  //! Delete
  //                                                                                                      //

  deleteStats(id: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
