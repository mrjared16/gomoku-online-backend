import { RoomModel } from './room.model';
import { GomokuGamePlayer } from 'src/game/game.dto';
import { UserDTO } from 'src/users/users.dto';
export type RoomOption = {
  time: number;
  password: string | null;
  boardSize: number;
};

export class RoomOptionDTO {
  time: number;
  boardSize: number;
  hasPassword: boolean;
  static ModelToEntity(roomOptionModel: RoomOption): RoomOptionDTO {
    const { time, password, boardSize } = roomOptionModel;
    return {
      time,
      boardSize,
      hasPassword: password !== null,
    };
  }
}

export type RoomRequirement = {
  password: string;
} | null;

export type CreateRoomDTO = {
  token: string;
  roomOption: RoomOption;
};

export type JoinRoomDTO = {
  action: 'join';
  token: string;
  roomID: string;
  roomRequirement: RoomRequirement;
};

export type StartGameDTO = {
  roomID: string;
};

export class RoomDTO {
  id: string;
  host: UserDTO;
  roomOption: RoomOptionDTO;
  players: GomokuGamePlayer;
  numberOfUsers: number;
  gameID: string | null;

  static ModelToDTO(roomModel: RoomModel): RoomDTO {
    const { id, host, roomOption, players, users, gameID } = roomModel;
    return {
      id,
      host,
      roomOption: RoomOptionDTO.ModelToEntity(roomOption),
      players,
      numberOfUsers: users.length,
      gameID: gameID,
    };
  }
}
