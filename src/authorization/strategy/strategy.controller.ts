import {
  Controller,
  Get,
  Res,
  HttpStatus,
  Param,
  Post,
  UseInterceptors,
  // FileInterceptor,
  UploadedFile,
  HttpException,
} from '@nestjs/common';
import { StrategyService } from './strategy.service';
import { ApiOperation, ApiResponse, ApiUseTags } from '@nestjs/swagger';

@ApiUseTags('v1')
@Controller('v1')
export class StrategyController {
  constructor(private readonly passportService: StrategyService) {}

  @Get('info')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Oni Client retrieved successfully.',
  })
  @ApiOperation({
    title: 'Get current Oni Client',
    description: 'Replies with JSON info on Oni ',
  })
  public getInfo(): any {
    return 'info';
  }

  @Get('passport/:sourceName')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Passport credentials retrived successfully.',
  })
  @ApiOperation({
    title: 'Obtain passport credentials for a given service',
    description: 'Replies with a list of buckets on the Oni container',
  })
  public authorizeSource(
    @Param('sourceName') sourceName: string,
  ): Promise<any> {
    return this.passportService.authorizeSource(sourceName);
  }

  // @Get('buckets/:bucketName')
  // @ApiResponse({ status: HttpStatus.OK, description: 'Oni bucket retrieved by name successfully.' })
  // @ApiOperation({
  //   title: 'List a Oni bucket by name',
  //   description: 'Replies with a list of objects in a bucket on the Oni container',
  // })
  // public getBucketList(@Param('bucketName') bucketName: string): Promise<Array<Minio.BucketItem>> {
  //   return this.oniService.listBucketObjects(bucketName);
  // }

  // @Get('object/:bucketName/:fileName')
  // @ApiResponse({ status: HttpStatus.OK, description: 'Oni object from bucket retrieved by name successfully.' })
  // @ApiOperation({
  //   title: 'List a Oni object by bucket and file name',
  //   description: 'Replies with the targeted object on the Oni container',
  // })
  // public async getBucketObject(@Res() res, @Param('bucketName') bucketName: string, @Param('fileName') fileName: string): Promise<any> {
  //   const filePath = await this.oniService.getBucketObject(bucketName, fileName);
  //   res.sendFile(filePath);
  // }

  // @Post('upload/:bucketName')
  // @ApiResponse({ status: HttpStatus.OK, description: 'Oni object uplaoded to bucket successfully.' })
  // @ApiOperation({
  //   title: 'Uplaod an object to a Oni bucket',
  //   description: 'Replies with a successful result message after uploading an object on a Oni bucket',
  // })
  // @UseInterceptors(FileInterceptor('file', {
  //   storage: multer.diskStorage({
  //     destination: (req, file, cb) => {
  //       cb(null, './tmp');
  //     },
  //     filename: (req, file, cb) => {
  //       cb(null, `${file.originalname}`);
  //     },
  //   }),
  //   fileFilter: (req, file, cb) => {
  //     let ext = extname(file.originalname);
  //     if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
  //       return cb(new HttpException('Only images are allowed!', HttpStatus.BAD_REQUEST), null);
  //     }
  //     cb(null, true);
  //   },
  //   limits: { fileSize: 1024 * 1024 },
  // }))
  // public async uploadToBucket(@Res() res, @UploadedFile() file, @Param('bucketName') bucketName: string): Promise<any> {
  //   await this.oniService.uploadToBucket(file, bucketName);
  //   res.send({
  //     bucketName,
  //     fileName: file.originalname,
  //     status: 'SUCCESS',
  //     message: `uploaded ${file.originalname} to bucket: ${bucketName}`,
  //   });
  // }
}
