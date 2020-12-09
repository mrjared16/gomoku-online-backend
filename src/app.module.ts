import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { Config } from './shared/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';

@Module({
  imports: [TypeOrmModule.forRoot(Config.getTypeORMConfig()), UserModule, AuthModule, GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(connection: Connection) { }
}
