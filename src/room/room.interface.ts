import { RoomDTO } from './room.dto';
import { UserDTO } from 'src/users/users.dto';
import { RoomModel } from './room.model';
import { ApiProperty, ApiResponse, ApiResponseProperty } from '@nestjs/swagger';

export class BroadcastRoomEventToAllResponse {
  event: 'roomUpdated';
  data:
    | RoomDTO
    | {
        id: string;
      }
    | {
        id: string;
        isRemoved: boolean;
      };
}

export type BroadcastRoomEventToCurrentRoomResponse =
  | {
      event: 'newPlayerJoined';
      data: { user: UserDTO };
    }
  | {
      event: 'roomUpdated';
      data:
        | RoomDTO
        | {
            id: string;
            isKicked: boolean;
          };
    };

export class AllRoomResponse {
  @ApiProperty({
    type: RoomDTO,
    isArray: true,
  })
  rooms: RoomDTO[];
}

export type CreateRoomResponse =
  | {
      roomID: string;
    }
  | never;

export type JoinRoomResponse = RoomDTO | never;

export type StartGameResponse = {
  gameID: string;
};

export type JoinTableResponse = {
  message: {
    type: 'success' | 'error';
    content: string;
  };
};
