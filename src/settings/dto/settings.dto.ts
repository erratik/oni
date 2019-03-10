import { ApiModelProperty } from '@nestjs/swagger';
import { ICredentials } from '../../settings/interfaces/settings.schema';
import { Sources } from '../../app.constants';

export class SettingsDto {
  @ApiModelProperty()
  readonly space: Sources;

  @ApiModelProperty()
  owner?: string;

  @ApiModelProperty()
  scope?: string;

  @ApiModelProperty()
  credentials?: Array<ICredentials>;
}
