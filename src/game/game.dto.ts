import { MoveRecordDTO } from 'src/gameHistory/gameHistory.dto';
import { GameSide } from 'src/gameHistory/moveRecord.entity';
import { UserDTO } from 'src/users/users.dto';

export class GameState {
  move: MoveRecordDTO[];
  turn: Turn;
}

export class Turn {
  playerID: string;
  remainingTime: number;
}

export type GameOption = {
  boardSize: number;
  time: number;
};

export type HitDTO = {
  roomID: string;
  gameID: string;
  position: number;
  value: GameSide;
};

export type JoinDTO = {
  roomID: string;
  gameID: string;
};

export type GomokuGamePlayer = {
  X: UserDTO | null;
  O: UserDTO | null;
};
