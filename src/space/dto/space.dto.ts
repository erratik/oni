import { ApiModelProperty } from '@nestjs/swagger';

export class SpaceDto {
  @ApiModelProperty()
  readonly name: string;

  @ApiModelProperty()
  readonly icon: string;

  @ApiModelProperty()
  readonly username: string;

  @ApiModelProperty()
  readonly description: string;
}
