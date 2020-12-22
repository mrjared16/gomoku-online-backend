import { UserDTO } from 'src/users/users.dto';
import { RoomModel } from './room.model';

export class BroadcastRoomEventToAllResponse {
  event: 'roomUpdated';
  data: RoomModel;
}

export type BroadcastRoomEventToCurrentRoomResponse =
  | {
      event: 'newPlayerJoined';
      data: { user: UserDTO };
    }
  | {
      event: 'roomUpdated';
      data: RoomModel;
    };

export class AllRoomResponse {
  rooms: RoomModel[];
}
