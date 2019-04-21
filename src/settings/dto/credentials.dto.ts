import { ApiModelProperty } from '@nestjs/swagger';

export class CredentialsDto {
  @ApiModelProperty()
  readonly space: string;

  @ApiModelProperty()
  readonly clientId: string;

  @ApiModelProperty()
  readonly clientSecret: string;

  @ApiModelProperty()
  readonly authorizationUrl: string;

  @ApiModelProperty()
  readonly grantorUrl?: string;

  @ApiModelProperty()
  readonly scopes?: string;
}
