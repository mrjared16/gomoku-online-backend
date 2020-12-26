import { forwardRef, Inject } from '@nestjs/common';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io/dist/socket';
import { Config } from 'src/shared/config';
import { ROOM_MESSAGE } from './room.constants';
import {
  CreateRoomDTO,
  JoinRoomDTO,
  JoinTableDTO,
  StartGameDTO,
} from './room.dto';
import {
  BroadcastRoomEventToAllResponse,
  BroadcastRoomEventToCurrentRoomResponse,
  CreateRoomResponse,
  JoinRoomResponse,
  JoinTableResponse,
  StartGameResponse,
} from './room.interface';
import { RoomService } from './room.service';

@WebSocketGateway(Number(Config.getCurrentHost().socketPort), {
  namespace: 'room',
})
export class RoomGateway implements OnGatewayConnection {
  constructor(
    @Inject(forwardRef(() => RoomService))
    private roomService: RoomService,
  ) {}

  @WebSocketServer() server: Socket;

  handleConnection(client: Socket, ...args: any[]) {
    // this.roomService.handleConnection(this, client);

    console.log('Room Gateway listen!');
  }

  @SubscribeMessage(ROOM_MESSAGE.ON_CREATE)
  async createRoom(
    socket: Socket,
    data: CreateRoomDTO,
  ): Promise<CreateRoomResponse> {
    const newRoom = await this.roomService.handleCreateRoom(this, socket, data);
    if (!newRoom) {
      return;
    }
    return {
      roomID: newRoom.roomID,
    };
  }

  @SubscribeMessage(ROOM_MESSAGE.ON_TABLE_JOIN)
  async joinTable(
    socket: Socket,
    data: JoinTableDTO,
  ): Promise<JoinTableResponse> {
    const success = await this.roomService.handleJoinTable(this, socket, data);
    if (success) {
      return {
        message: {
          type: 'success',
          content: '',
        },
      };
    }
    return {
      message: {
        type: 'error',
        content: '',
      },
    };
  }

  @SubscribeMessage(ROOM_MESSAGE.ON_JOIN)
  async joinRoom(
    socket: Socket,
    data: JoinRoomDTO,
  ): Promise<JoinTableResponse> {
    const updatedRoom = await this.roomService.handleUsersChanged(
      this,
      socket,
      data,
    );
    if (!updatedRoom) {
      return;
    }
    // console.log({ updatedRoom });
    // return RoomDTO.ModelToDTO(updatedRoom);
  }

  @SubscribeMessage(ROOM_MESSAGE.ON_START)
  async startGame(
    socket: Socket,
    data: StartGameDTO,
  ): Promise<StartGameResponse> {
    const { gameID } = await this.roomService.handleStartGame(
      this,
      socket,
      data,
    );
    return { gameID: gameID };
  }

  broadcastRoomEventsToAll(
    broadcastRoomToAllDTO: BroadcastRoomEventToAllResponse,
  ) {
    console.log({ broadcastRoomToAllDTO });
    this.server.emit(ROOM_MESSAGE.BROADCAST_ALL, broadcastRoomToAllDTO);
  }

  broadcastRoomEventToMember(
    room: Socket,
    roomID: string,
    broadcastRoomEventToCurrentRoomDTO: BroadcastRoomEventToCurrentRoomResponse,
    isBroadcast = false,
  ) {
    console.log({ broadcastRoomEventToCurrentRoomDTO });
    const socket = isBroadcast ? this.server.in(roomID) : room.to(roomID);
    socket.emit(
      ROOM_MESSAGE.BROADCAST_ROOM,
      broadcastRoomEventToCurrentRoomDTO,
    );
  }
}
