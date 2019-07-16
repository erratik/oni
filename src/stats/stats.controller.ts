import { Controller, Get, UseGuards, Response, Param, Query, HttpStatus, Delete, Body, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StatsService } from './stats.service';
import { ApiUseTags } from '@nestjs/swagger';

@ApiUseTags('stats')
@Controller('v1/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  async getStats(@Query() query, @Response() res, @Req() req, @Body() search) {
    // debugger;
    query.owner = req.user.username;
    query = { search, ...query };
    return await this.statsService.getStats(query).then(stats => {
      if (!stats) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No stats found with query ${JSON.stringify(query)}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(stats);
      }
    });
  }

  @Delete('stats')
  @UseGuards(AuthGuard('jwt'))
  async deleteStats(@Param() param, @Response() res, @Body() body, @Query() query) {
    return await this.statsService.deleteStats(body).then(stats => {
      if (!stats) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `No stats for ${param.space}`,
        });
      } else {
        return res.status(HttpStatus.OK).json(stats);
      }
    });
  }
}
