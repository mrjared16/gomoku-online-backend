import { RoomDTO } from './room.dto';
import { UserDTO } from 'src/users/users.dto';
import { RoomModel } from './room.model';

export class BroadcastRoomEventToAllResponse {
  event: 'roomUpdated';
  data: RoomDTO;
}

export type BroadcastRoomEventToCurrentRoomResponse =
  | {
      event: 'newPlayerJoined';
      data: { user: UserDTO };
    }
  | {
      event: 'roomUpdated';
      data: RoomDTO;
    };

export class AllRoomResponse {
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
