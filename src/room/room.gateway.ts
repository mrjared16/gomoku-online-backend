import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io/dist/socket';
import { AuthService } from 'src/auth/auth.service';
import { Config } from 'src/shared/config';
import { Server } from 'typeorm';
import { RoomMessage } from './room.constants';
import { BroadcastRoomEventToAllDTO, BroadcastGameEventToCurrentRoomDTO, BroadcastRoomEventToCurrentRoomDTO, CreateRoomDTO, JoinRoomDTO } from './room.dto';
import { RoomService } from './room.service';
import { RoomManager } from './roomManager';

@WebSocketGateway(Number(Config.getCurrentHost().socketPort), {
  namespace: 'room'
})
export class RoomGateway implements OnGatewayConnection {

  constructor(
    private roomService: RoomService,
    private authService: AuthService,
  ) {

  }

  @WebSocketServer() server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    // this.roomService.handleConnection(this, client);

    console.log('listen!');
  }
  @SubscribeMessage(RoomMessage.ON_CREATE)
  async createRoom(socket: Socket, data: CreateRoomDTO) {
    const newRoom = await this.roomService.handleCreateRoom(this, socket, data);
    if (!newRoom) {
      return;
    }
    return {
      roomID: newRoom.roomID
    };
  }

  @SubscribeMessage(RoomMessage.ON_JOIN)
  async joinRoom(socket: Socket, data: JoinRoomDTO) {
    const roomDetail = await this.roomService.handleJoinRoom(this, socket, data);
    if (!roomDetail) {
      return;
    }
    console.log({ roomDetail });
    return roomDetail;
  }

  broadcastRoomEventsToAll(broadcastRoomToAllDTO: BroadcastRoomEventToAllDTO) {
    console.log({ broadcastRoomToAllDTO });
    this.server.emit(RoomMessage.BROADCAST_ALL, broadcastRoomToAllDTO);
  }

  broadcastRoomEventToMember(room: Socket, roomID: string, broadcastRoomEventToCurrentRoomDTO: BroadcastRoomEventToCurrentRoomDTO) {
    console.log({ broadcastRoomEventToCurrentRoomDTO });
    room.to(roomID).emit(RoomMessage.BROADCAST_ROOM, broadcastRoomEventToCurrentRoomDTO);
  }

  broadcastGameEventToMember(room: Socket, roomID: string, broadcastGameEventToCurrentRoomDTO: BroadcastGameEventToCurrentRoomDTO) {
    console.log({ broadcastRoomEventToCurrentRoomDTO: broadcastGameEventToCurrentRoomDTO });
    room.to(roomID).emit(RoomMessage.BROADCAST_GAME, broadcastGameEventToCurrentRoomDTO);
  }
  @SubscribeMessage('start')
  async startGame(socket: Socket, data: { roomID: string }) {
    await this.roomService.handleStartGame(this, socket, data);
  }

  @SubscribeMessage('hit')
  async hit(socket: Socket, data: { roomID: string, index: number, value: 0 | 1 }) {
    await this.roomService.handleHit(this, socket, data);
  }
}