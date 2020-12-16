import { Config } from 'src/shared/config';
import { Injectable, Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthService } from 'src/auth/auth.service';
import { WaitingRoomService } from './waitingRoom.service';
import { BroadcastUserDTO } from './waitingRoom.dto';
import { WaitingRoomMessage } from './waitingRoom.constants';

@WebSocketGateway(Number(Config.getCurrentHost().socketPort), {
  namespace: 'waitingRoom',
  // transports: ['websocket']
})
export class WaitingRoomGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(
    private authService: AuthService,
    private waitingRoomService: WaitingRoomService
  ) {

  }

  @WebSocketServer() server: Server;

  logger: Logger = new Logger('GameGateway');

  @SubscribeMessage('ping')
  async init() {
    this.server.emit('serverPingMsg', 'hello');
    console.log('hello');
    return 'im here';
  }

  /* a connection connect */
  async handleConnection(client: Socket, ...args: any[]) {
    this.waitingRoomService.handleConnection(this,
      client,
      this.waitingRoomService.handleOnAnonymousConnect,
      this.waitingRoomService.handleOnAuthenticatedUserConnect);
  }

  /* a connection disconnected */
  async handleDisconnect(client: Socket) {
    this.waitingRoomService.handleConnection(this,
      client,
      this.waitingRoomService.handleOnAnonymousDisconnect,
      this.waitingRoomService.handleOnAuthenticatedUserDisconnect);

  }


  broadcastUserEvent(broadcastUserDTO: BroadcastUserDTO, message: string = null) {
    this.server.emit(WaitingRoomMessage.BROADCAST_USER, broadcastUserDTO);

    if (broadcastUserDTO.user == 'anonymous') {
      this.logger.log(`An anonymous user ${broadcastUserDTO.event}`);
      return;
    }

    if (!message) {
      this.logger.log(`An user ${broadcastUserDTO.event}: ${broadcastUserDTO.user.username}`);
      return;
    }

    this.logger.log(`${message}: ${broadcastUserDTO.event}: ${broadcastUserDTO.user.username}`)
  }

  afterInit(server: Server) {
    this.logger.log(`Game Socket is running on port ${Config.getCurrentHost().socketPort}`);
  }
}
