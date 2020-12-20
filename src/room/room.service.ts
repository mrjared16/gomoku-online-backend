import { Socket } from 'socket.io';
import { UserDTO } from 'src/users/users.dto';
import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { RoomGateway } from './room.gateway';
import { RoomManager, RoomModel } from './roomManager';
import { CreateRoomDTO, JoinRoomDTO } from './room.dto';

@Injectable()
export class RoomService {
  constructor(private authService: AuthService) {}
  roomManager: RoomManager = new RoomManager();

  // handleOnAnonymousConnect = (roomGateway: RoomGateway, connection: Socket) => {
  //   // this.socketManager.addAnonymousUser(connection);
  //   // roomGateway.broadcastUserEvent({
  //   //   user: 'anonymous',
  //   //   event: 'connected'
  //   // });
  // }

  // handleOnAnonymousDisconnect = (roomGateway: RoomGateway, connection: Socket) => {
  //   // this.socketManager.removeAnonymousUser(connection);
  //   // roomGateway.broadcastUserEvent({
  //   //   user: 'anonymous',
  //   //   event: 'disconnected'
  //   // });
  // }

  // handleOnAuthenticatedUserConnect = (roomGateway: RoomGateway, connection: Socket, userDTO: UserDTO) => {
  //   // this.socketManager.addUser(userDTO, connection);

  //   // roomGateway.broadcastUserEvent({
  //   //   user: userDTO,
  //   //   event: 'connected'
  //   // },
  //   //   this.socketManager.didUserOnlineAlready(userDTO) ? 'User online on new client' : null
  //   // );
  // }

  // handleOnAuthenticatedUserDisconnect = (roomGateway: RoomGateway, connection: Socket, userDTO: UserDTO) => {
  //   // this.socketManager.removeUser(userDTO, connection);

  //   // roomGateway.broadcastUserEvent({
  //   //   user: userDTO,
  //   //   event: 'disconnected'
  //   // }, null
  //   // );
  // }

  // async handleConnection(roomGateway: RoomGateway,
  //   connection: Socket,
  //   // onAnonymous: (roomGateway: RoomGateway, connection: Socket) => void,
  //   // onAuthenticated: (roomGateway: RoomGateway, connection: Socket, userDTO: UserDTO) => void
  // ) {
  //   const { query } = connection.handshake || { query: { token: null } };
  //   const { token } = query as { token: string };
  //   // if (!token) {
  //   //   onAnonymous(roomGateway, connection);
  //   //   return;
  //   // }

  //   // const userConnected = await this.authService.getUser(token);
  //   // if (!userConnected) {
  //   //   return;
  //   // }
  //   // onAuthenticated(roomGateway, connection, userConnected);
  //   // // console.log({ users: this.getUsers() });
  // }

  async handleCreateRoom(
    roomGateway: RoomGateway,
    socket: Socket,
    data: CreateRoomDTO,
  ) {
    const { token } = data;
    if (!token) {
      return;
    }

    const userInfo = await this.authService.getUser(token);
    if (!userInfo) {
      return;
    }

    const newRoom = this.roomManager.addNewRoom(userInfo, socket);
    roomGateway.broadcastRoomEventsToAll({
      event: 'roomUpdated',
      data: newRoom,
    });
    console.log({ newRoom });
    return {
      roomID: newRoom.id,
    };
  }

  async handleJoinRoom(
    roomGateway: RoomGateway,
    socket: Socket,
    data: JoinRoomDTO,
  ) {
    const { token } = data;
    if (!token) {
      return;
    }

    const userInfo = await this.authService.getUser(token);
    if (!userInfo) {
      return;
    }
    const handleJoinRoom = {
      join: (roomID: string, data: JoinRoomDTO): boolean => {
        if (this.roomManager.getRoom(roomID).addUser(userInfo)) {
          // return false;
        }
        const updatedRoom = this.roomManager.getRoom(roomID);
        roomGateway.broadcastRoomEventToMember(socket, roomID, {
          event: 'newPlayerJoined',
          data: updatedRoom,
        });

        roomGateway.broadcastRoomEventsToAll({
          event: 'roomUpdated',
          data: updatedRoom,
        });
        return true;
      },
    };
    const { roomID } = data;
    await socket.join(roomID);
    if (handleJoinRoom[data.action](roomID, data)) {
      return this.roomManager.getRoom(roomID);
    }
  }

  async handleStartGame(
    roomGateway: RoomGateway,
    socket: Socket,
    data: { roomID: string },
  ) {
    const { roomID } = data;
    const room = this.roomManager.getRoom(data.roomID);
    console.log({ data, room });
    roomGateway.broadcastGameEventToMember(
      socket,
      roomID,
      {
        event: 'changeTurn',
        data: {
          currentTurnPlayerID: room.getTurn(),
        },
      },
      true,
    );
  }
  async handleHit(
    roomGateway: RoomGateway,
    socket: Socket,
    data: { roomID: string; index: number; value: 0 | 1 },
  ) {
    const { roomID, index, value } = data;
    const room = this.roomManager.getRoom(data.roomID);
    room.hit(index, value);
    roomGateway.broadcastGameEventToMember(socket, roomID, {
      event: 'onHit',
      data: {
        index: index,
        value: value,
      },
    });
    roomGateway.broadcastGameEventToMember(
      socket,
      roomID,
      {
        event: 'changeTurn',
        data: {
          currentTurnPlayerID: room.getTurn(),
        },
      },
      true,
    );
  }
  getAllRoom(): RoomModel[] {
    return this.roomManager.getRooms();
  }
}
