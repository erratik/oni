import { ApiModelProperty } from '@nestjs/swagger';

export class AttributeSchemaDto {
  @ApiModelProperty()
  readonly space: string;

  @ApiModelProperty()
  type: string;

  @ApiModelProperty()
  path: string;
}
