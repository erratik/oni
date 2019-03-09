import { Controller, Get, UseGuards, HttpStatus, Response, Param, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { ApiUseTags } from '@nestjs/swagger';

@ApiUseTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  async getUsers(@Response() res) {
    return await this.userService.findAll().then(users => {
      if (!users) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'No users',
        });
      } else {
        return res.status(HttpStatus.OK).json(users);
      }
    });
  }

  @Get(':username')
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Param() query, @Response() res) {
    return await this.userService.getUserByName(query.username).then(user => {
      if (!user) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No user found for ${query.username}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(user);
      }
    });
  }

  @Get(':username/connect/source/:source')
  @UseGuards(AuthGuard('jwt'))
  async getUserSourceToken(@Param() username, @Param() source, @Response() res) {
    return await this.userService.getUserByName(username).then(users => {
      if (!users) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `Failed to get a token from ${source} for ${username}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(users);
      }
    });
  }
}
