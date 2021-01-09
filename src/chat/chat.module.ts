import { ChatService } from './chat.service';
import { ChatChannelEntity } from 'src/chat/chatChannel.entity';
import { ChatRecordEntity } from 'src/chat/chatRecord.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRecordEntity, ChatChannelEntity])],
  exports: [ChatService, ChatGateway],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
