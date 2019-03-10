import { ApiModelProperty } from '@nestjs/swagger';

export class CredentialsDto {
  @ApiModelProperty()
  readonly space: string;

  @ApiModelProperty()
  readonly clientId: string;

  @ApiModelProperty()
  readonly clientSecret: string;

  @ApiModelProperty()
  readonly callbackUrl: string;
}
