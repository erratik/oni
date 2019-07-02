import { ApiModelProperty } from '@nestjs/swagger';

export class DropSchemaDto {
  @ApiModelProperty()
  space?: string;

  @ApiModelProperty()
  owner?: string;

  @ApiModelProperty()
  type?: string;

  @ApiModelProperty()
  keyMap: any[];
}
