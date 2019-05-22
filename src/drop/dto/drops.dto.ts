import { ApiModelProperty } from '@nestjs/swagger';
import { IDropItem } from '../interfaces/drop-item.schema';
import { IDropSchema } from '../../drop-schemas/interfaces/drop-schema.schema';

export class DropSetDto {
  @ApiModelProperty()
  owner: string;

  @ApiModelProperty()
  readonly space: string;

  @ApiModelProperty()
  readonly type: string;

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
}
