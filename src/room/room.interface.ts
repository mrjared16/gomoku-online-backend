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
