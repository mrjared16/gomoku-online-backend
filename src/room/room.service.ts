import { GameService } from './../game/game.service';
import { Socket } from 'socket.io';
import { UserDTO } from 'src/users/users.dto';
import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { RoomGateway } from './room.gateway';
import { CreateRoomDTO, JoinRoomDTO } from './room.dto';
import { RoomManager, RoomModel } from './room.model';

@Injectable()
export class RoomService {
  constructor(
    private authService: AuthService,
    private roomManager: RoomManager,
    private gameService: GameService,
  ) {}

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
    const handleJoinRoom = {
      join: (roomID: string, data: JoinRoomDTO): boolean => {
        const { roomRequirement } = data;
        if (
          this.roomManager.getRoom(roomID).addUser(userInfo, roomRequirement)
        ) {
          // TODO: handle not able to join room (not meet requirement or server error)
          return false;
        }
        const updatedRoom = this.roomManager.getRoom(roomID);

        // broadcast to current room
        roomGateway.broadcastRoomEventToMember(socket, roomID, {
          event: 'roomUpdated',
          data: updatedRoom,
        });

        // broadcast to waiting room
        roomGateway.broadcastRoomEventsToAll({
          event: 'roomUpdated',
          data: updatedRoom,
        });
        return true;
      },
    };

    const { token } = data;
    if (!token) {
      return;
    }

    const userInfo = await this.authService.getUser(token);
    if (!userInfo) {
      return;
    }

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

    room.startGame(this.gameService);

    roomGateway.broadcastRoomEventToMember(
      socket,
      roomID,
      {
        event: 'roomUpdated',
        data: room,
      },
      true,
    );

    console.log({ data, room });
  }

  getAllRoom(): RoomModel[] {
    return this.roomManager.getRooms();
  }
}
