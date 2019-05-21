import { ApiModelProperty } from '@nestjs/swagger';

export class SpaceDto {
  @ApiModelProperty()
  owner: string;

  @ApiModelProperty()
  readonly name: string;

  @ApiModelProperty()
  readonly icon?: string;

  @ApiModelProperty()
  readonly requests?: any[];
}
