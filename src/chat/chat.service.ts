import { AuthService } from 'src/auth/auth.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { ChatChannelEntity } from 'src/chat/chatChannel.entity';
import { ChatRecordEntity } from 'src/chat/chatRecord.entity';
import { RoomManager } from 'src/room/room.model';
import { Repository } from 'typeorm';
import { ChatRecordDTO, SentMessageToRoomChatDTO } from './chat.dto';
import { ChatGateway } from './chat.gateway';
import { UserEntity } from 'src/users/users.entity';
@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatChannelEntity)
    private chatRepository: Repository<ChatChannelEntity>,
    @InjectRepository(ChatRecordEntity)
    private chatRecordRepository: Repository<ChatRecordEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
    private roomManager: RoomManager,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async createChatChannelForRoom(): Promise<ChatChannelEntity> {
    const newChatChannel = this.chatRepository.create();
    return await this.chatRepository.save(newChatChannel);
  }

  async handleSentMessageToRoomChat(
    socket: Socket,
    roomMessageData: SentMessageToRoomChatDTO,
  ) {
    const { roomID, data } = roomMessageData;
    const { token } = data;

    const room = this.roomManager.getRoom(roomID);
    if (!room) {
      return;
    }

    const userInfo = await this.authService.getUser(token);
    if (!userInfo) {
      return;
    }

    const chatChannel = room.getChatChannelEntity();
    const { content } = data;
    const newChatRecord = this.chatRecordRepository.create({
      channel: chatChannel,
      user: this.userRepository.create({ id: userInfo.id }),
      content: content,
    });

    const newChatRecordResponse = await this.chatRecordRepository.save(
      newChatRecord,
    );

    this.chatGateway.broadcastChatEventToMember(socket, roomID, {
      event: 'onReceivedMessage',
      data: ChatRecordDTO.EntityToDTO(newChatRecordResponse),
    });
  }
}
