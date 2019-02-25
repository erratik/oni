import { Injectable, Inject } from '@nestjs/common';
import { getObjectCacheKey } from '../../shared/cache/cache.service';
import { LoggerService } from '../../shared/services/logger.service';
import { ConfigService } from '../../config/config.service';
import { RedisCacheService } from '../../shared/cache/redis-cache.service';

import { Strategy as SpotifyStrategy } from 'passport-spotify';
import passport from '@nestjs/passport';

@Injectable()
export class StrategyService {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisCacheService: RedisCacheService,
    private readonly loggerService: LoggerService,
  ) {}

  public async authorizeSource(sourceName: string): Promise<any> {
    // passport.use(
    //   new SpotifyStrategy(
    //     {
    //       clientID: '3feeae922b1948259f84de73e8a3200b',
    //       clientSecret: '1acc12aa83bc40d3bc9bb1d937f3dbb4',
    //       callbackURL: `http://datawhore.erratik.ca:10011/auth/${sourceName}/callback`,
    //     },
    //     (accessToken, refreshToken, expires_in, profile, done) => {
    //       console.log(accessToken, refreshToken, expires_in, profile, done);
    //       return done('done');
    //       // User.findOrCreate({ spotifyId: profile.id }, function(err, user) {
    //       //   return done(err, user);
    //       // });
    //     },
    //   ),
    // );
  }

  // public listBucketObjects(
  //   bucketName: string,
  //   prefix?: string,
  //   recursive: boolean = true): Promise<Array<Minio.BucketItem>> | any {

  //   const stream = this.minioClient.listObjects(bucketName, prefix, recursive);
  //   const bucketObjects: Array<Minio.BucketItem> = [];

  //   return new Promise((resolve, reject) => {
  //     stream.on('data', (obj) => {
  //       bucketObjects.push(obj);
  //       resolve(bucketObjects);
  //       return obj;
  //     });

  //   });
  // }

  // public getBucketObject(
  //   bucketName: string,
  //   fileName: string): Promise<string> {

  //   this.loggerService.log('[OniService]', `Get object from bucket`);

  //   return this.redisCacheService.getItemOrElse(
  //     getObjectCacheKey(bucketName, fileName),
  //     this.configService.config.cacheDuration,
  //     () => {
  //       return new Promise((resolve, reject) => {
  //         this.minioClient.fGetObject(bucketName, fileName, `/public/${bucketName}/${fileName}`, (err) => {
  //           if (err) {
  //             return reject(err);
  //           }
  //           resolve(`/public/${bucketName}/${fileName}`);
  //         });
  //       });
  //     });
  // }

  // public uploadToBucket(
  //   file: { filename: string, path: string, mimetype: string },
  //   bucketName: string): Promise<any> {

  //   return new Promise((resolve, reject) => {

  //     const metaData = {
  //       'Content-Type': file.mimetype,
  //       'Cache-Control': 'max-age=' + this.configService.config.cacheDuration,
  //     };

  //     return this.minioClient.fPutObject(bucketName, file.filename, file.path, metaData, (err, etag) => {
  //       if (err) {
  //         return reject(err);
  //       }
  //       resolve(file.path);
  //     });
  //   });

  // }
}
