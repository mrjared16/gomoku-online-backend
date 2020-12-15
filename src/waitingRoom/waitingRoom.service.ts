import { WaitingRoomGateway } from './waitingRoom.gateway';
import { Socket } from 'socket.io';
import { UserDTO } from 'src/users/users.dto';
import { Injectable } from "@nestjs/common";
import { AuthService } from 'src/auth/auth.service';
import { SocketManager } from './socketManager';

@Injectable()
export class WaitingRoomService {
  constructor(
    private authService: AuthService
  ) {
  }
  socketManager: SocketManager = new SocketManager();

  handleOnAnonymousConnect(waitingRoomGateWay: WaitingRoomGateway, connection: Socket) {
    this.socketManager.addAnonymousUser(connection);
    waitingRoomGateWay.broadcastUserEvent({
      user: 'anonymous',
      event: 'connected'
    });
  }

  handleOnAnonymousDisconnect(waitingRoomGateWay: WaitingRoomGateway, connection: Socket) {
    this.socketManager.removeAnonymousUser(connection);
    waitingRoomGateWay.broadcastUserEvent({
      user: 'anonymous',
      event: 'disconnected'
    });
  }

  handleOnAuthenticatedUserConnect(waitingRoomGateWay: WaitingRoomGateway, connection: Socket, userDTO: UserDTO) {
    this.socketManager.addUser(userDTO, connection);

    waitingRoomGateWay.broadcastUserEvent({
      user: userDTO,
      event: 'connected'
    },
      this.socketManager.didUserOnlineAlready(userDTO) ? 'User online on new client' : null
    );
  }

  handleOnAuthenticatedUserDisconnect(waitingRoomGateWay: WaitingRoomGateway, connection: Socket, userDTO: UserDTO) {
    this.socketManager.removeUser(userDTO, connection);

    waitingRoomGateWay.broadcastUserEvent({
      user: userDTO,
      event: 'disconnected'
    }, null
    );
  }

  async handleConnection(waitingRoomGateWay: WaitingRoomGateway,
    connection: Socket,
    onAnonymous: (waitingRoomGateWay: WaitingRoomGateway, connection: Socket) => void,
    onAuthenticated: (waitingRoomGateWay: WaitingRoomGateway, connection: Socket, userDTO: UserDTO) => void
  ) {
    const { query } = connection.handshake;
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
  }


  getUsers() {
    return this.socketManager.getUsers();
  }
}