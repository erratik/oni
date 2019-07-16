import { ApiModelProperty } from '@nestjs/swagger';
import { IStatsErrors, IStatsInserted, IStatsTimes } from '../../stats/interfaces/stats.schema';

export class StatsSchemaDto {
  @ApiModelProperty()
  space: string;

  @ApiModelProperty()
  owner: string;

  @ApiModelProperty()
  type: string;

  @ApiModelProperty()
  error: IStatsErrors;
  // duplicateCount
  // otherErrCount

  @ApiModelProperty()
  manual: boolean;

  @ApiModelProperty()
  inserted: IStatsInserted;
  // added
  // duplicates

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  range: any;

  @ApiModelProperty()
  username: string;
}
