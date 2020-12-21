import { RoomModel } from './roomManager';
import { UserDTO } from 'src/users/users.dto';

export class BroadcastRoomEventToAllDTO {
  event: 'roomUpdated';
  data: RoomModel;
}

export class BroadcastGameEventToCurrentRoomDTO {
  event: 'changeTurn' | 'onHit';
  data:
    | {
        index: number;
        value: 0 | 1;
      }
    | {
        currentTurnPlayerID: string;
      };
}

export class BroadcastRoomEventToCurrentRoomDTO {
  event: 'newPlayerJoined' | 'roomUpdated';
  data:
    | {
        user: UserDTO;
      }
    | RoomModel;
}

export type CreateRoomDTO = {
  token: string;
};

export type JoinRoomDTO = {
  action: 'join';
  roomID: string;
  token: string;
};

// export type RoomDetailInterface = {
//   host: UserDTO,
//   opponent: UserDTO | null,
//   boardSize: 20,
//   currentTurnPlayerID: string,
//   board: (0 | 1 | -1)[]
// }
