import { INestApplication, INestExpressApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { VersionModule } from './version/version.module';
import { VersionService } from './version/version.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { AppModule } from './app.module';
import * as logger from 'morgan';
import { join } from 'path';
import { LogFormats } from './shared/constants/formats.constant';

function bootstrapLogger(app: INestApplication & INestExpressApplication) {
  const logFormat: LogFormats = LogFormats.DefaultFormat;
  const errorLogFormat: LogFormats = LogFormats.ErrorLogFormat;

  logger.token('responseBody', (_, res: any) => res._data);
  logger.token('ip', req => ((req.headers['x-forwarded-for'] as string) || (req.connection.remoteAddress as string)).replace(/^.*:/, ''));

  app.use(logger(logFormat, {
    skip: (_, res) => res.statusCode >= 400,
  }) as any);
  app.use(logger(errorLogFormat, {
    skip: (_, res) => res.statusCode < 400,
  }) as any);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useStaticAssets(join(__dirname, 'public'), {
    index: false,
    redirect: false,
  });

  /**
   *  Build Swagger
   */
  const options = new DocumentBuilder()
    .setTitle('oni')
    .setDescription('kusanagi api backend')
    .setVersion(app.select(VersionModule).get(VersionService).version)
    .setSchemes(app.select(ConfigModule).get(ConfigService).config.swaggerScheme)
    .setBasePath(app.select(ConfigModule).get(ConfigService).swaggerBasePath)
    .addTag('v1')
    .addTag('auth')
    .addTag('status')
    .addTag('version')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('documentation', app, document);

  bootstrapLogger(app);
  await app.listen(10011);
}
bootstrap();
