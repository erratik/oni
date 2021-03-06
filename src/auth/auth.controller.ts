import { Controller, UseGuards, HttpStatus, Response, Post, Body, Get, Req, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiUseTags, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from '../user/dto/createUser.dto';
import { UserService } from '../user/user.service';
import { LoginUserDto } from '../user/dto/loginUser.dto';

@ApiUseTags('auth')
@Controller('auth')
export class AuthController {
  constructor(public authService: AuthService, public userService: UserService) {}
  // constructor() {}

  @Post('register')
  @ApiResponse({ status: HttpStatus.OK, description: 'Attempts to validate user with credentials (email, token)' })
  async register(@Response() res, @Body() createUserDto: CreateUserDto) {
    const result = await this.authService.register(createUserDto);
    if (!result.success) {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json(result);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Response() res, @Body() login: LoginUserDto) {
    return await this.userService.getUser({ username: login.username }).then(async user => {
      if (!user) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'User Not Found',
        });
      } else {
        console.log('start getting the token');
        const updatedUser = await this.authService.createToken(user);
        return res.status(HttpStatus.OK).json(updatedUser);
      }
    });
  }
}
