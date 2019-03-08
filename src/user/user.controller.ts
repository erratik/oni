import { Controller, Get, UseGuards, Post, HttpException, HttpStatus, Param, Body, Res, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { ApiUseTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { LoggerService } from '../shared/services/logger.service';
import { ConfigService } from '../config/config.service';
import { AuthService } from '../auth/auth.service';

import { IToken } from '../auth/interfaces/auth.interfaces';
import { IUser } from '../repository/schemas/user.schema';

@ApiUseTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private authService: AuthService,
    private logger: LoggerService,
    private configService: ConfigService
  ) {}

  @Get('token/:user')
  @ApiResponse({ status: HttpStatus.OK, description: 'Generated JWT Token' })
  @ApiOperation({
    title: 'Request a JWT for a given user, hardcoded dev@erratik.ca',
    description: `Replies with signed JWT payload`,
  })
  async createToken(@Param() user: IUser): Promise<IToken> {
    this.logger.log('[UserController]', `Requesting user token`);
    return await this.authService.createToken(user);
  }

  // @Post('user/validation')
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Attempts to validate user with credentials (email, accessToken)',
  // })
  // @ApiOperation({
  //   title: 'Validate user with credentials',
  //   description: `Replies with ...`,
  // })
  // async validateUser(@Body() user: UserDTO): Promise<any> {
  //   // if (!user.email) {
  //   //   throw new HttpException('No user provided!', HttpStatus.INTERNAL_SERVER_ERROR);
  //   // } else if (!user.accessToken) {
  //   //   throw new HttpException('No access token provided!', HttpStatus.INTERNAL_SERVER_ERROR);
  //   // } else {
  //   //   this.logger.log('[UserController]', `Requesting validation for user email account: ${user.email} with provided accessToken`);
  //   //   const validatedUser = await this.userService.validateUser({ email: user.email }, { accessToken: user.accessToken });
  //   //   return { ...validatedUser };
  //   //   // .catch(err => {
  //   //   //   this.logger.log('![UserController]', `something went with validateUser: ${JSON.stringify(err)}`);
  //   //   //   throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
  //   //   // });
  //   // }
  // }
}
