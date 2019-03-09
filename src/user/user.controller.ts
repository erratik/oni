import { Controller, Get, UseGuards, HttpStatus, Response, Param } from '@nestjs/common';
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
  async getUser(@Param() username, @Response() res) {
    return await this.userService.getUserByName(username).then(users => {
      if (!users) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No user found for ${username}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(users);
      }
    });
  }
}
