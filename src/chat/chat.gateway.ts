import { forwardRef, Inject } from '@nestjs/common';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { Config } from 'src/shared/config';
import { ChatService } from './chat.service';

@WebSocketGateway(Number(Config.getCurrentHost().socketPort), {
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection {
  constructor(
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
  ) {}
  handleConnection(client: any, ...args: any[]) {
    console.log('Chat Gateway listen!');
  }
}
