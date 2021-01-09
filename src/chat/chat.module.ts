import { AuthModule } from 'src/auth/auth.module';
import { RoomModule } from './../room/room.module';
import { ChatService } from './chat.service';
import { ChatChannelEntity } from 'src/chat/chatChannel.entity';
import { ChatRecordEntity } from 'src/chat/chatRecord.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UserEntity } from 'src/users/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRecordEntity, ChatChannelEntity, UserEntity]),
    RoomModule,
    AuthModule,
  ],
  exports: [ChatService, ChatGateway],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
