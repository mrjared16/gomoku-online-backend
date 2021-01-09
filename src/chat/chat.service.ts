import { RoomModel } from 'src/room/room.model';
import { ChatRecordEntity } from 'src/chat/chatRecord.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatChannelEntity } from 'src/chat/chatChannel.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatChannelEntity)
    private chatRepository: Repository<ChatChannelEntity>,
    @InjectRepository(ChatRecordEntity)
    private chatRecordRepository: Repository<ChatRecordEntity>,
  ) {}

  async createChatChannelForRoom(): Promise<ChatChannelEntity> {
    const newChatChannel = this.chatRepository.create();
    return await this.chatRepository.save(newChatChannel);
  }
}
