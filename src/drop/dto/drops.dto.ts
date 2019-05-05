import { ApiModelProperty } from '@nestjs/swagger';
import { IDropItem } from '../interfaces/drop-item.schema';
import { IDropSchema } from '../../drop/interfaces/drop-schema.schema';

export class DropSchemaDto {
  @ApiModelProperty()
  owner: string;

  @ApiModelProperty()
  readonly id?: string;

  @ApiModelProperty()
  readonly space: string;

  @ApiModelProperty()
  readonly drops?: IDropItem[];

  @ApiModelProperty()
  readonly schemas?: IDropSchema[];

  // @ApiModelProperty()
  // readonly stats?: any;

  @ApiModelProperty()
  readonly endpoint?: any;

  @ApiModelProperty()
  readonly navigation?: any;

  @ApiModelProperty()
  readonly keys?: string[];
}
