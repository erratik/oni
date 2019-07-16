import { StatsSchemaDto } from '../../stats/dto/stats.dto';
import { IStatsEntry } from './stats.schema';

export interface IStatsService {
  getStats(space: string, sorter?: any): Promise<IStatsEntry[]>;
  deleteStats(id: string): Promise<any>;
  upsertStats(update: StatsSchemaDto): Promise<StatsSchemaDto>;
}
