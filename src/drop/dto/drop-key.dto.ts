import { ApiModelProperty } from '@nestjs/swagger';

export class DropKeyDto {
  @ApiModelProperty()
  readonly type: string;

  @ApiModelProperty()
  readonly path: string;

  @ApiModelProperty()
  format: string;

  @ApiModelProperty()
  enabled: boolean;

  @ApiModelProperty()
  readonly attribute: string;
}
