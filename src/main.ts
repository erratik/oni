
import { join }  from 'path';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { VersionModule } from './version/version.module';
import { VersionService } from './version/version.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useStaticAssets(join(__dirname, '../public'), {
    index: false,
    redirect: false,
  });

  const options = new DocumentBuilder()
    .setTitle('oni')
    .setDescription('kusanagi api backend')
    .setVersion(app.select(VersionModule).get(VersionService).version)
    .setSchemes(app.select(ConfigModule).get(ConfigService).config.swaggerScheme)
    .setBasePath(app.select(ConfigModule).get(ConfigService).swaggerBasePath)
    // .addTag('v1')
    .addTag('status')
    .addTag('version')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('documentation', app, document);
  await app.listen(4529);

}
bootstrap();
