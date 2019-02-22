import { ApiUseTags } from '@nestjs/swagger';
import { Controller, Get, HttpCode, InternalServerErrorException } from '@nestjs/common';
import { StatusService } from './status.service';

@ApiUseTags('status')
@Controller('status')
export class StatusController {

  constructor(private statusService: StatusService) { }

  @Get()
  @HttpCode(200)
  async getStatus() {
    try {
      return await this.statusService.getStatus();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
