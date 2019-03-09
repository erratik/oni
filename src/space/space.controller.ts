import { Controller, Get, UseGuards, HttpStatus, Response, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SpaceService } from './space.service';
import { ApiUseTags } from '@nestjs/swagger';
import { SpaceDto } from './dto/space.dto';

@ApiUseTags('spaces')
@Controller('v1/spaces')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  async getSpaces(@Response() res) {
    return await this.spaceService.findAll().then(spaces => {
      if (!spaces) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'No spaces',
        });
      } else {
        return res.status(HttpStatus.OK).json(spaces);
      }
    });
  }

  @Get(':spaceName')
  @UseGuards(AuthGuard('jwt'))
  async getSpace(@Param() param, @Response() res) {
    return await this.spaceService.getSpaceByName(param.spaceName).then(space => {
      if (!space) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No space found for ${param.spaceName}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(space);
      }
    });
  }

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createSpace(@Response() res, @Body() spaceDto: SpaceDto) {
    return await this.spaceService.create(spaceDto).then(space => res.status(HttpStatus.OK).json(space));
  }

  @Put('update')
  @UseGuards(AuthGuard('jwt'))
  async updateSpace(@Response() res, @Body() spaceDto: SpaceDto) {
    return await this.spaceService.update(spaceDto).then(space => res.status(HttpStatus.OK).json(space));
  }

  @Delete('delete')
  @UseGuards(AuthGuard('jwt'))
  async deleteSpace(@Response() res, @Body() spaceDto: SpaceDto) {
    return await this.spaceService.delete(spaceDto).then(space => res.status(HttpStatus.OK).json(space));
  }

  // @Get(':userName/connect/space/:spaceName')
  // @UseGuards(AuthGuard('jwt'))
  // async getSpaceSourceToken(@Param() userName, @Param() spaceName, @Response() res) {
  //   return await this.spaceService.getSpaceByName(spaceName).then(spaces => {
  //     if (!spaces) {
  //       res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //         message: `Failed to get a token from ${userName} for ${spaceName}`,
  //       });
  //     } else {
  //       return res.status(HttpStatus.OK).json(spaces);
  //     }
  //   });
  // }
}
