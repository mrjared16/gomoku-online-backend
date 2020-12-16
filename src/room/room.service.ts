import { Socket } from 'socket.io';
import { UserDTO } from 'src/users/users.dto';
import { Injectable } from "@nestjs/common";
import { AuthService } from 'src/auth/auth.service';
import { RoomGateway } from './room.gateway';

@Injectable()
export class RoomService {
  constructor(
    private authService: AuthService
  ) {
  }

  handleOnAnonymousConnect = (roomGateway: RoomGateway, connection: Socket) => {
    // this.socketManager.addAnonymousUser(connection);
    // roomGateway.broadcastUserEvent({
    //   user: 'anonymous',
    //   event: 'connected'
    // });
  }

  handleOnAnonymousDisconnect = (roomGateway: RoomGateway, connection: Socket) => {
    // this.socketManager.removeAnonymousUser(connection);
    // roomGateway.broadcastUserEvent({
    //   user: 'anonymous',
    //   event: 'disconnected'
    // });
  }

  handleOnAuthenticatedUserConnect = (roomGateway: RoomGateway, connection: Socket, userDTO: UserDTO) => {
    // this.socketManager.addUser(userDTO, connection);

    // roomGateway.broadcastUserEvent({
    //   user: userDTO,
    //   event: 'connected'
    // },
    //   this.socketManager.didUserOnlineAlready(userDTO) ? 'User online on new client' : null
    // );
  }

  handleOnAuthenticatedUserDisconnect = (roomGateway: RoomGateway, connection: Socket, userDTO: UserDTO) => {
    // this.socketManager.removeUser(userDTO, connection);

    // roomGateway.broadcastUserEvent({
    //   user: userDTO,
    //   event: 'disconnected'
    // }, null
    // );
  }

  async handleConnection(roomGateway: RoomGateway,
    connection: Socket,
    // onAnonymous: (roomGateway: RoomGateway, connection: Socket) => void,
    // onAuthenticated: (roomGateway: RoomGateway, connection: Socket, userDTO: UserDTO) => void
  ) {
    const { query } = connection.handshake || { query: { token: null } };
    const { token } = query as { token: string };
    // if (!token) {
    //   onAnonymous(roomGateway, connection);
    //   return;
    // }

    // const userConnected = await this.authService.getUser(token);
    // if (!userConnected) {
    //   return;
    // }
    // onAuthenticated(roomGateway, connection, userConnected);
    // // console.log({ users: this.getUsers() });
  }


  getUsers() {
    // return this.socketManager.getUsers();
  }
}