import { Socket } from 'socket.io';
import { forwardRef, Inject } from '@nestjs/common';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Config } from 'src/shared/config';
import { CHAT_MESSAGE } from './chat.constants';
import { ChatService } from './chat.service';
import { JoinChatRoomDTO, SentMessageToRoomChatDTO } from './chat.dto';
import { BroadcastChatEventToCurrentChannelDTO } from './chat.interface';

@WebSocketGateway(Number(Config.getCurrentHost().socketPort), {
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection {
  constructor(
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
  ) {}

  @WebSocketServer() server: Socket;

  handleConnection(client: any, ...args: any[]) {
    console.log('Chat Gateway listen!');
  }

  @SubscribeMessage(CHAT_MESSAGE.ON_JOIN)
  async handleJoinRoomChat(socket: Socket, data: JoinChatRoomDTO) {
    const { chatChannelID } = data;
    await socket.join(chatChannelID);
  }

  @SubscribeMessage(CHAT_MESSAGE.ON_SENT)
  async handleSentMessageToRoomChat(
    socket: Socket,
    data: SentMessageToRoomChatDTO,
  ) {
    await this.chatService.handleSentMessageToRoomChat(socket, data);
  }

  broadcastChatEventToMember(
    room: Socket,
    chatChannel: string,
    broadcastChatEventToCurrentChannelDTO: BroadcastChatEventToCurrentChannelDTO,
    isBroadcast = false,
  ) {
    // console.log({
    //   broadcastGameEventToCurrentRoomDTO: broadcastChatEventToCurrentChannelDTO,
    // });
    const socket = isBroadcast
      ? this.server.in(chatChannel)
      : room.to(chatChannel);
    socket.emit(
      CHAT_MESSAGE.BROADCAST_CHAT,
      broadcastChatEventToCurrentChannelDTO,
    );
  }
}
