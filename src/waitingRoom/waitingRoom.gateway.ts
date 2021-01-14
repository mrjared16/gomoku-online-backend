import { Config } from 'src/shared/config';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WaitingRoomService } from './waitingRoom.service';
import { BroadcastUserDTO, InviteDTO, LogOutDTO } from './waitingRoom.dto';
import { WaitingRoomMessage as WAITINGROOM_MESSAGE } from './waitingRoom.constants';
import { InviteRoomResponse } from './waitingRoom.interface';

// @WebSocketGateway(Number(Config.getCurrentHost().socketPort), {
//   namespace: 'waitingRoom',
//   // transports: ['websocket']
// })
@WebSocketGateway({
  namespace: 'waitingRoom',
  // transports: ['websocket']
})
export class WaitingRoomGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(
    private authService: AuthService,
    @Inject(forwardRef(() => WaitingRoomService))
    private waitingRoomService: WaitingRoomService,
  ) {}

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
    this.waitingRoomService.handleConnection(
      this,
      client,
      this.waitingRoomService.handleOnAnonymousConnect,
      this.waitingRoomService.handleOnAuthenticatedUserConnect,
    );
  }

  /* a connection disconnected */
  async handleDisconnect(client: Socket) {
    this.waitingRoomService.handleConnection(
      this,
      client,
      this.waitingRoomService.handleOnAnonymousDisconnect,
      this.waitingRoomService.handleOnAuthenticatedUserDisconnect,
    );
  }

  broadcastUserEvent(
    broadcastUserDTO: BroadcastUserDTO,
    message: string = null,
  ) {
    this.server.emit(WAITINGROOM_MESSAGE.BROADCAST_USER, broadcastUserDTO);

    if (broadcastUserDTO.user == 'anonymous') {
      this.logger.log(`An anonymous user ${broadcastUserDTO.event}`);
      return;
    }

    if (!message) {
      this.logger.log(
        `An user ${broadcastUserDTO.event}: ${broadcastUserDTO.user.username}`,
      );
      return;
    }

    this.logger.log(
      `${message}: ${broadcastUserDTO.event}: ${broadcastUserDTO.user.username}`,
    );
  }

  afterInit(server: Server) {
    this.logger.log(
      `Game Socket is running on port ${Config.getCurrentHost().socketPort}`,
    );
  }

  @SubscribeMessage(WAITINGROOM_MESSAGE.ONROOM)
  async inviteUser(socket: Socket, data: InviteDTO) {
    const success = await this.waitingRoomService.handleInviteUser(
      socket,
      data,
    );
  }

  @SubscribeMessage(WAITINGROOM_MESSAGE.ONLOGOUT)
  async handleUserLogout(socket: Socket, data: LogOutDTO) {
    await this.waitingRoomService.handleUserLogout(socket, data);
  }

  broadcastToUser(username: string, data: InviteRoomResponse) {
    const sockets = this.waitingRoomService.getAllSocketClientID(username);
    sockets.forEach((socket) =>
      this.server.to(socket).emit(WAITINGROOM_MESSAGE.ROOM, data),
    );
  }
}
