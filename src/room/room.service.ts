import { UserDTO } from './../users/users.dto';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { GameService } from './../game/game.service';
import {
  CreateRoomDTO,
  JoinRoomDTO,
  RoomDTO,
  StartGameDTO,
  JoinTableDTO,
} from './room.dto';
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
      data: RoomDTO.ModelToDTO(newRoom),
    });
    console.log({ newRoom });
    return {
      roomID: newRoom.id,
    };
  }

  async handleUsersChanged(
    roomGateway: RoomGateway,
    socket: Socket,
    requestData: JoinRoomDTO,
  ) {
    const handleJoinRoom = {
      join: async (roomID: string, data: JoinRoomDTO, userInfo: UserDTO) => {
        if (data.action !== 'join') {
          return;
        }

        const { roomRequirement } = data.data;
        if (
          !this.roomManager.getRoom(roomID).addUser(userInfo, roomRequirement)
        ) {
          // TODO: handle not able to join room (not meet requirement or server error)
          return;
        }
        await socket.join(roomID);
        this.broadcastRoomState({ roomGateway, roomID, socket });
        return this.roomManager.getRoom(roomID);
      },
      leave: async (roomID: string, data: JoinRoomDTO, userInfo: UserDTO) => {
        if (data.action !== 'leave') {
          return;
        }
        console.log(`${userInfo.username} leaved room ${roomID}`);
        await socket.leave(roomID);
        const room = this.roomManager.getRoom(roomID);
        if (room.isHost(userInfo)) {
          if (this.roomManager.removeRoom(roomID)) {
            this.broadcastRoomState({ roomGateway, roomID, socket });
          }
          return;
        }
        room.removeUser(userInfo.id);
        this.broadcastRoomState({ roomGateway, roomID, socket });
      },
      kick: async (roomID: string, data: JoinRoomDTO, userInfo: UserDTO) => {
        if (data.action !== 'kick') {
          return;
        }
        console.log(`${userInfo.username} is kicked out of room ${roomID}`);
      },
    };
    const { data } = requestData;
    const { token } = data;
    if (!token) {
      return;
    }

    const userInfo = await this.authService.getUser(token);
    if (!userInfo) {
      return;
    }

    const { roomID } = data;

    return handleJoinRoom[requestData.action](roomID, requestData, userInfo);
  }

  async handleJoinTable(
    roomGateway: RoomGateway,
    socket: Socket,
    requestData: JoinTableDTO,
  ) {
    const handleJoinTable = {
      join: (
        room: RoomModel,
        data: JoinTableDTO,
        userInfo: UserDTO,
      ): boolean => {
        if (data.action !== 'join') {
          return;
        }
        const { side } = data.data;
        const result = room.setPlayer(userInfo, side);

        if (!result) return false;

        this.broadcastRoomState({ roomGateway, roomID, socket });
        return true;
      },
      leave: (
        room: RoomModel,
        data: JoinTableDTO,
        userInfo: UserDTO,
      ): boolean => {
        if (data.action !== 'leave') {
          return;
        }
        const result = room.setPlayer(userInfo, null);

        if (!result) return false;

        this.broadcastRoomState({ roomGateway, roomID, socket });
        return true;
      },
      kick: (
        room: RoomModel,
        data: JoinTableDTO,
        userInfo: UserDTO,
      ): boolean => {
        if (data.action !== 'kick') {
          return;
        }
        if (!room.isHost(userInfo)) {
          return false;
        }
        const { playerId } = data.data;
        const result = room.kickPlayer(playerId);

        if (!result) return false;

        this.broadcastRoomState({ roomGateway, roomID, socket });
        return true;
      },
    };

    const { data, action } = requestData;
    const { token } = data;
    if (!token) {
      return;
    }

    const userInfo = await this.authService.getUser(token);
    if (!userInfo) {
      return;
    }

    const { roomID } = data;
    const room = this.roomManager.getRoom(roomID);
    return handleJoinTable[action](room, requestData, userInfo);
  }

  async handleStartGame(
    roomGateway: RoomGateway,
    socket: Socket,
    data: StartGameDTO,
  ) {
    const { roomID } = data;
    const room = this.roomManager.getRoom(data.roomID);

    await room.startGame(this.gameService);
    this.broadcastRoomState({ roomGateway, socket, roomID });
    // console.log({ data, room });

    return { gameID: room.gameID };
  }

  handleEndGame(roomGateway: RoomGateway, room: RoomModel, socket: Socket) {
    // TODO: handle save game to database
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
    const data = !!room
      ? RoomDTO.ModelToDTO(room)
      : {
          id: roomID,
          host: null,
        };
    // broadcast to current room
    roomGateway.broadcastRoomEventToMember(
      socket,
      roomID,
      {
        event: 'roomUpdated',
        data,
      },
      true,
    );
    // broadcast to waiting room
    roomGateway.broadcastRoomEventsToAll({
      event: 'roomUpdated',
      data,
    });
  }

  getAllRoom(): RoomDTO[] {
    return this.roomManager.getRooms().map((room) => RoomDTO.ModelToDTO(room));
  }
}
