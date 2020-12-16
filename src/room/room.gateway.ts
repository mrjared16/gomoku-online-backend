import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io/dist/socket';
import { Config } from 'src/shared/config';
import { Server } from 'typeorm';
import { RoomMessage } from './room.constants';
import { BroadcastRoomEventToAllDTO, JoinRoomDTO, BroadcastRoomEventToCurrentRoomDTO, CreateRoomDTO } from './room.dto';
import { RoomService } from './room.service';

@WebSocketGateway(Number(Config.getCurrentHost().socketPort), {
  namespace: 'room'
})
export class RoomGateway implements OnGatewayConnection {

  constructor(private roomService: RoomService) {

  }

  @WebSocketServer() server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    // this.roomService.handleConnection(this, client);

    console.log('listen!');
  }
  @SubscribeMessage(RoomMessage.ON_CREATE)
  async createRoom(socket: Socket, data: CreateRoomDTO) {
    const getRoomID = (): string => {
      return (new Date()).toString();
    }

    const roomID = getRoomID();
    this.broadcastRoomEventsToAll({
      event: 'newRoomCreated',
      data: {
        room: roomID
      }
    })
    return {
      roomID
    };
  }

  @SubscribeMessage(RoomMessage.ON_JOIN)
  async joinRoom(socket: Socket, data: JoinRoomDTO) {
    const getRoomID = {
      'join': (data: JoinRoomDTO): string => {
        const { roomID } = data;
        return roomID;
      }
    }
    const handleJoinRoom = {
      'join': (roomID: string, data: JoinRoomDTO) => {
        this.broadcastRoomEventToMember(socket, roomID, {
          event: 'newPlayerJoined',
          data: {
            userId: '123'
          }
        })
      }
    }

    const roomID = getRoomID[data.action](data);
    await socket.join(roomID);
    handleJoinRoom[data.action](roomID, data);
  }

  broadcastRoomEventsToAll(broadcastRoomToAllDTO: BroadcastRoomEventToAllDTO) {
    console.log({ broadcastRoomToAllDTO });
    this.server.emit(RoomMessage.BROADCAST_ALL, broadcastRoomToAllDTO);
  }

  broadcastRoomEventToMember(room: Socket, roomID: string, broadcastRoomEventToCurrentRoomDTO: BroadcastRoomEventToCurrentRoomDTO) {
    console.log({ broadcastRoomEventToCurrentRoomDTO });
    room.to(roomID).emit(RoomMessage.BROADCAST_ROOM, broadcastRoomEventToCurrentRoomDTO);
  }
}