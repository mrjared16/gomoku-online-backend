import { Config } from './shared/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [TypeOrmModule.forRoot(Config.getTypeORMConfig())],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(connection: Connection) { }
}
