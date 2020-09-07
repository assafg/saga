import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Mongo } from './mongo';


@Module({
  imports: [ConfigModule.forRoot(), ConfigModule],
  controllers: [AppController],
  providers: [Mongo, AppService, Logger],
})
export class AppModule {}
