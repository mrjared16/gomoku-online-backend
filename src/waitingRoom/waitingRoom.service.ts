import { WaitingRoomGateway } from './waitingRoom.gateway';
import { Socket } from 'socket.io';
import { UserDTO } from 'src/users/users.dto';
import { Injectable } from "@nestjs/common";
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class WaitingRoomService {
  constructor(
    private authService: AuthService
  ) {

  }


  map: Map<string, {
    user: UserDTO,
    socket: string[]
  }> = new Map();

  getUsers(): UserDTO[] {
    return Array.from(this.map.values()).map(e => e.user);
  }

  addAnonymousUser(client: Socket) {

  }
  removeAnonymousUser(client: Socket) {

  }
  addUser(userData: UserDTO, client: Socket) {
    const { username } = userData;
    const socket = [...(this.map.has(username) ? this.map.get(username).socket : []), clientId];
    this.map.set(username, {
      user: userData,
      socket
    });
  }

  removeUser(userData: UserDTO, client: Socket) {
    const { username } = userData;
    const current = this.map.get(username);
    const newSocket = current.socket.filter(socket => socket != clientId);
    if (newSocket.length > 0) {
      this.map.set(username, {
        ...current, socket: newSocket
      })
      return
    }

    this.map.delete(username);
  }

  didUserOnlineAlready(userData: UserDTO): boolean {
    const { username } = userData;
    return this.map.has(username);
  }

  handleOnAnonymousConnect(waitingRoomGateWay: WaitingRoomGateway, connection: Socket) {
    this.addAnonymousUser(connection);
    waitingRoomGateWay.broadcastUserEvent({
      user: 'anonymous',
      event: 'connected'
    });
  }

  handleOnAnonymousDisconnect(waitingRoomGateWay: WaitingRoomGateway, connection: Socket) {
    this.removeAnonymousUser(connection);
    waitingRoomGateWay.broadcastUserEvent({
      user: 'anonymous',
      event: 'disconnected'
    });
  }

  handleOnAuthenticatedUserConnect(waitingRoomGateWay: WaitingRoomGateway, connection: Socket, userDTO: UserDTO) {
    this.addUser(userDTO, connection);

    waitingRoomGateWay.broadcastUserEvent({
      user: userDTO,
      event: 'connected'
    },
      this.didUserOnlineAlready(userDTO) ? 'User online on new client' : null
    );
  }

  handleOnAuthenticatedUserDisconnect(waitingRoomGateWay: WaitingRoomGateway, connection: Socket, userDTO: UserDTO) {
    this.removeUser(userDTO, connection);

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

}