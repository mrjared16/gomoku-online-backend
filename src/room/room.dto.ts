import { RoomModel } from './room.model';
import { GomokuGamePlayer, GameSide } from 'src/game/game.dto';
import { UserDTO } from 'src/users/users.dto';
import { ApiProperty } from '@nestjs/swagger';
export type RoomOption = {
  time: number;
  password: string | null;
  boardSize: number;
};

export class RoomOptionDTO {
  @ApiProperty()
  time: number;
  @ApiProperty()
  boardSize: number;
  @ApiProperty()
  hasPassword: boolean;

  static ModelToEntity(room: RoomModel): RoomOptionDTO {
    const { time, boardSize } = room;
    return {
      time,
      boardSize,
      hasPassword: room.hasPassword(),
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

export type JoinRoomRequestDTO = {
  token: string;
  roomID: string;
  roomRequirement: RoomRequirement;
};

export type JoinRoomDTO =
  | {
      action: 'join';
      data: {
        token: string;
        roomID: string;
        roomRequirement: RoomRequirement;
      };
    }
  | {
      action: 'leave';
      data: { token: string; roomID: string };
    }
  | {
      action: 'kick';
      data: { token: string; roomID: string };
    };

export type JoinTableDTO =
  | {
      action: 'join';
      data: {
        token: string;
        roomID: string;
        side: GameSide;
      };
    }
  | {
      action: 'leave';
      data: {
        token: string;
        roomID: string;
      };
    }
  | {
      action: 'kick';
      data: {
        token: string;
        roomID: string;
        playerId: string;
      };
    };

export type StartGameDTO = {
  roomID: string;
};

export class RoomDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  host: UserDTO;
  @ApiProperty()
  roomOption: RoomOptionDTO;
  @ApiProperty()
  players: GomokuGamePlayer;
  @ApiProperty()
  numberOfUsers: number;
  @ApiProperty()
  gameID: string | null;
  @ApiProperty()
  chatChannelID: string;
  @ApiProperty({
    type: UserDTO,
    isArray: true,
  })
  users: UserDTO[];

  static ModelToDTO(roomModel: RoomModel): RoomDTO {
    const { id, host, players, users, gameID, chatChannelID } = roomModel;
    return {
      id,
      host,
      roomOption: RoomOptionDTO.ModelToEntity(roomModel),
      players,
      numberOfUsers: users.length,
      gameID: gameID,
      users,
      chatChannelID,
    };
  }
}
