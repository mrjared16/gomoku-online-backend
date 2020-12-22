import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { GameSide } from 'src/gameHistory/moveRecord.entity';
import { GameService } from './../game/game.service';
import { CreateRoomDTO, JoinRoomDTO, StartGameDTO } from './room.dto';
import { RoomGateway } from './room.gateway';
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

  async handleUsersChanged(
    roomGateway: RoomGateway,
    socket: Socket,
    data: JoinRoomDTO,
  ) {
    const handleJoinRoom = {
      join: (roomID: string, data: JoinRoomDTO): boolean => {
        const { roomRequirement } = data;
        if (
          !this.roomManager.getRoom(roomID).addUser(userInfo, roomRequirement)
        ) {
          // TODO: handle not able to join room (not meet requirement or server error)
          return false;
        }

        this.broadcastRoomState({ roomGateway, roomID, socket });
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

  handleStartGame(
    roomGateway: RoomGateway,
    socket: Socket,
    data: StartGameDTO,
  ) {
    const { roomID } = data;
    const room = this.roomManager.getRoom(data.roomID);
    // TODO: handle join game
    room.setPlayer(room.users[0], GameSide.X);
    room.setPlayer(room.users[1], GameSide.O);

    room.startGame(this.gameService);
    this.broadcastRoomState({ roomGateway, socket, roomID });
    console.log({ data, room });
  }

  handleEndGame(roomGateway: RoomGateway, room: RoomModel, socket: Socket) {
    room.save();
    room.endGame();
    this.broadcastRoomState({
      roomGateway,
      roomID: room.id,
      socket,
    });
  }

  broadcastRoomState({
    roomGateway,
    roomID,
    socket,
  }: {
    roomGateway: RoomGateway;
    socket: Socket;
    roomID: string;
  }) {
    const room = this.roomManager.getRoom(roomID);
    // broadcast to current room
    roomGateway.broadcastRoomEventToMember(
      socket,
      roomID,
      {
        event: 'roomUpdated',
        data: room,
      },
      true,
    );
    // broadcast to waiting room
    roomGateway.broadcastRoomEventsToAll({
      event: 'roomUpdated',
      data: room,
    });
  }

  getAllRoom(): RoomModel[] {
    return this.roomManager.getRooms();
  }
}
