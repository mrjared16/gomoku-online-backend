import { RoomService } from './../room/room.service';
import { WaitingRoomMessage } from './waitingRoom.constants';
import { WaitingRoomGateway } from './waitingRoom.gateway';
import { Socket } from 'socket.io';
import { UserDTO } from 'src/users/users.dto';
import { forwardRef, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { SocketManager } from './socketManager';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';

@Injectable()
export class WaitingRoomService {
  constructor(
    private authService: AuthService,
    @Inject(forwardRef(() => RoomService))
    private roomService: RoomService,
  ) {}
  socketManager: SocketManager = new SocketManager();

  handleOnAnonymousConnect = (
    waitingRoomGateWay: WaitingRoomGateway,
    connection: Socket,
  ) => {
    this.socketManager.addAnonymousUser(connection);
    waitingRoomGateWay.broadcastUserEvent({
      user: 'anonymous',
      event: 'connected',
    });
  };

  handleOnAnonymousDisconnect = (
    waitingRoomGateWay: WaitingRoomGateway,
    connection: Socket,
  ) => {
    this.socketManager.removeAnonymousUser(connection);
    waitingRoomGateWay.broadcastUserEvent({
      user: 'anonymous',
      event: 'disconnected',
    });
  };

  handleOnAuthenticatedUserConnect = (
    waitingRoomGateWay: WaitingRoomGateway,
    connection: Socket,
    userDTO: UserDTO,
  ) => {
    const userStatus = this.socketManager.getUserStatus(userDTO.username);
    // console.log({ userStatus });
    if (userStatus?.isPlayingGame && userStatus?.roomID) {
      connection.emit(WaitingRoomMessage.RECONNECT, {
        roomID: userStatus.roomID,
      });
    }
    if (!this.socketManager.addUser(userDTO, connection)) {
      return;
    }
    waitingRoomGateWay.broadcastUserEvent(
      {
        user: userDTO,
        event: 'connected',
      },
      this.socketManager.didUserOnlineAlready(userDTO)
        ? 'User online on new client'
        : null,
    );
  };

  handleOnAuthenticatedUserDisconnect = (
    waitingRoomGateWay: WaitingRoomGateway,
    connection: Socket,
    userDTO: UserDTO,
  ) => {
    const userStatus = { ...this.getUserStatus(userDTO.username) };
    if (userStatus.roomID) {
      this.roomService.handleUserDisconnect(userStatus.roomID, userStatus.user);
    }
    const isPlaying = !!userStatus.isPlayingGame && !!userStatus.roomID;
    const isRemoved = !isPlaying;
    // console.log({ userStatus });
    if (!this.socketManager.removeUser(userDTO, connection, isRemoved)) {
      return;
    }

    waitingRoomGateWay.broadcastUserEvent(
      {
        user: userDTO,
        event: 'disconnected',
      },
      null,
    );
  };

  async handleConnection(
    waitingRoomGateWay: WaitingRoomGateway,
    connection: Socket,
    onAnonymous: (
      waitingRoomGateWay: WaitingRoomGateway,
      connection: Socket,
    ) => void,
    onAuthenticated: (
      waitingRoomGateWay: WaitingRoomGateway,
      connection: Socket,
      userDTO: UserDTO,
    ) => void,
  ) {
    const { query } = connection.handshake || { query: { token: null } };
    const { token } = query as { token: string };
    if (!token) {
      onAnonymous(waitingRoomGateWay, connection);
      return;
    }

    const userConnected = await this.authService.getUser(token);
    if (!userConnected) {
      return;
    }
    onAuthenticated(waitingRoomGateWay, connection, userConnected);
    // console.log({ users: this.getUsers() });
  }

  getUsers() {
    return this.socketManager.getUsers();
  }

  onUserJoinRoom(username: string, roomID: string) {
    this.socketManager.setUserStatus(username, { roomID });
  }

  onUserLeaveRoom(username: string) {
    this.socketManager.setUserStatus(username, { roomID: null });
  }

  onUserPlayGame(username: string) {
    this.socketManager.setUserStatus(username, { isPlayingGame: true });
  }

  onUserLeaveGame(username: string) {
    this.socketManager.setUserStatus(username, { isPlayingGame: false });
  }

  getUserStatus(username: string) {
    return this.socketManager.getUserStatus(username);
  }
}
