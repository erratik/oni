import { ApiModelProperty } from '@nestjs/swagger';

export class DropKeyDto {
  @ApiModelProperty()
  readonly type: string;

  @ApiModelProperty()
  path: string;

  @ApiModelProperty()
  format: string;

  @ApiModelProperty()
  enabled?: boolean;

  @ApiModelProperty()
  displayName: boolean;

  @ApiModelProperty()
  broadcast?: boolean;

  @ApiModelProperty()
  attribute?: string;
}
