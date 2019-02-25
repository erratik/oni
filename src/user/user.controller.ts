import { Controller, Get, UseGuards, Post, HttpException, HttpStatus, Param, Body, Res, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { ApiUseTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { LoggerService } from '../shared/services/logger.service';
import { ConfigService } from '../config/config.service';
import { UserDTO } from '../shared/models/dto.models';
import { TokenResponse } from '../shared/interfaces/jwt-payload.interfaces';

@ApiUseTags('v1/auth')
@Controller('v1/auth')
export class UserController {
  constructor(private readonly userService: UserService, private logger: LoggerService, private configService: ConfigService) {}

  @Get('user/token')
  @ApiResponse({ status: HttpStatus.OK, description: 'Generated JWT Token' })
  @ApiOperation({
    title: 'Request a JWT for a given user, hardcoded dev@erratik.ca',
    description: `Replies with signed JWT payload`,
  })
  async createToken(): Promise<TokenResponse> {
    this.logger.log('[UserController]', `Requesting user token`);
    return await this.userService.createToken();
  }

  @Post('user/validation')
  @ApiResponse({ status: HttpStatus.OK, description: 'Attempts to validate user with credentials (email, accessToken)' })
  @ApiOperation({
    title: 'Validate user with credentials',
    description: `Replies with ...`,
  })
  async validateUser(@Body() user: UserDTO): Promise<UserDTO | HttpStatus> {
    if (!user.email) {
      throw new HttpException('No user provided!', HttpStatus.INTERNAL_SERVER_ERROR);
    } else if (!user.accessToken) {
      throw new HttpException('No access token provided!', HttpStatus.INTERNAL_SERVER_ERROR);
    } else {
      this.logger.log('[UserController]', `Requesting validation for user email account: ${user.email} with provided accessToken`);

      const validatedUser = await this.userService.validateUser(
        { email: user.email },
        { accessToken: user.accessToken, expiresIn: Date.now() + this.configService.config.jwtTokenDuration },
      );

      return { ...validatedUser, accessToken: user.accessToken, expiresIn: Date.now() + this.configService.config.jwtTokenDuration };
      // .catch(err => {
      //   this.logger.log('![UserController]', `something went with validateUser: ${JSON.stringify(err)}`);
      //   throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      // });
    }
  }

  @Get('data')
  @UseGuards(AuthGuard())
  findAll() {
    // This route is restricted by UserGuard
    // JWT strategy
  }
}
