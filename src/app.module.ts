import { ChatModule } from './chat/chat.module';
import { GameHistoryModule } from './gameHistory/gameHistory.module';
import { GameModule } from './game/game.module';
import { RoomModule } from './room/room.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { Config } from './shared/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WaitingRoomModule } from './waitingRoom/waitingRoom.module';
import { MailerModule } from '@nestjs-modules/mailer/dist/mailer.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(Config.getTypeORMConfig()),
    MailerModule.forRoot(Config.getMailServiceConfig()),
    UserModule,
    AuthModule,
    WaitingRoomModule,
    RoomModule,
    GameModule,
    GameHistoryModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(connection: Connection) {}
}
