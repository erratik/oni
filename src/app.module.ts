
import { ConfigModule } from './config/config.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { StatusModule } from './status/status.module';
import { VersionModule } from './version/version.module';
// import { ZeldaModule } from './zelda/zelda.module';

@Module({
  imports: [
    StatusModule,
    VersionModule,
    ConfigModule,
    // ZeldaModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
  }
}
