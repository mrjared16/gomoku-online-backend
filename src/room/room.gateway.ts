import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io/dist/socket';
import { Config } from 'src/shared/config';
import { Server } from 'typeorm';
import { RoomMessage } from './room.constants';
import { BroadcastRoomToAllDTO } from './room.dto';
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
  createRoom(socket: Socket, data: string) {
    const roomID = (new Date()).toString();
    socket.join(roomID);
    this.broadcastRoomEventsToAll({
      event: 'newRoomCreated',
      data: {
        room: roomID
      }
    })

  }

  broadcastRoomEventsToAll(broadcastRoomToAllDTO: BroadcastRoomToAllDTO) {
    console.log({ broadcastRoomToAllDTO });
    this.server.emit(RoomMessage.BROADCAST_ALL, broadcastRoomToAllDTO);
  }

  broadcastRoomEventToMember(room: Socket, roomID: string) {
    room.to(roomID).emit(RoomMessage.BROADCAST_ALL, {
      event: 'aRoom',
      data: {
        room: roomID
      }
    });
  }
}