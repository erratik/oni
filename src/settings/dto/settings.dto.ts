import { ApiModelProperty } from '@nestjs/swagger';
import { ICredentials, IAuthorization } from '../../settings/interfaces/settings.schema';
import { Sources } from '../../app.constants';

export class SettingsDto {
  @ApiModelProperty()
  owner: string;

  @ApiModelProperty()
  readonly space: Sources;

  @ApiModelProperty()
  readonly baseUrl: string;

  @ApiModelProperty()
  readonly cron: string;

  @ApiModelProperty()
  readonly authorization?: IAuthorization;

  @ApiModelProperty()
  readonly credentials?: ICredentials;
}
