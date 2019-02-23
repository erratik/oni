import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { VersionService } from './version.service';
import { ApiOperation, ApiResponse, ApiUseTags } from '@nestjs/swagger';

@ApiUseTags('version')
@Controller('version')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Version retrieved successfully.',
  })
  @ApiOperation({
    title: 'Get current API version',
    description: 'Replies with a string containing the version of the API',
  })
  getVersion(): string {
    return this.versionService.version;
  }
}
