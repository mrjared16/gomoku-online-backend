import { DEFAULT_BOARD_SIZE, DEFAULT_TURN_TIME } from 'src/game/game.constants';
import { RoomOption } from './room.dto';

export const ROOM_MESSAGE = {
  ON_JOIN: 'join',
  ON_CREATE: 'create',
  ON_START: 'start',
  BROADCAST_ALL: 'waitingRoomEventMsg',
  BROADCAST_ROOM: 'roomEventMsg',
};

export const DEFAULT_ROOM_OPTION: RoomOption = {
  time: DEFAULT_TURN_TIME,
  password: null,
  boardSize: DEFAULT_BOARD_SIZE,
};
