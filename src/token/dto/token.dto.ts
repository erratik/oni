import { ApiModelProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiModelProperty()
  readonly access_token: string;

  @ApiModelProperty()
  readonly refresh_token: string;

  @ApiModelProperty()
  readonly token_type?: string;

  @ApiModelProperty()
  owner: string;

  @ApiModelProperty()
  readonly scope?: string;

  @ApiModelProperty()
  readonly space: string;

  @ApiModelProperty()
  readonly oauth: any;

  @ApiModelProperty()
  readonly username?: string;

  @ApiModelProperty()
  readonly expires_in: number;
}
