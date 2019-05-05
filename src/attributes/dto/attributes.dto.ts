import { ApiModelProperty } from '@nestjs/swagger';

export class AttributeSchemaDto {
  @ApiModelProperty()
  readonly space: string;

  @ApiModelProperty()
  readonly path: string;

  @ApiModelProperty()
  type: string;

  @ApiModelProperty()
  displayName: string;
}
