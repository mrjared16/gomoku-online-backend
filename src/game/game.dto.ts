import { RankRecordDTO } from './../gameHistory/gameHistory.dto';
import { MoveRecordDTO } from 'src/gameHistory/gameHistory.dto';
import { GameSide } from 'src/gameHistory/moveRecord.entity';
export class GameInfoResponse {
  id: string;
  boardSize: number;
  gameState: GameState;
  startAt: Date | null;
  duration: number;
  winnerID: string | null;
  rankRecord: RankRecordDTO[];
}

export class GameState {
  move: MoveRecordDTO[];
  turn: Turn;
}

export class Turn {
  playerID: string;
  remainingTime: number;
}
