import { RankRecordDTO } from 'src/gameHistory/gameHistory.dto';
import { GameSide } from 'src/gameHistory/moveRecord.entity';
import { GameState } from './game.dto';

export type BroadcastGameEventToCurrentRoomResponse =
  | {
      event: 'changeTurn';
      data: {
        currentTurnPlayerID: string;
      };
    }
  | {
      event: 'onHit';
      data: {
        index: number;
        value: GameSide;
      };
    };

export type GameInfoResponse =
  | {
      id: string;
      boardSize: number;
      gameState: GameState;
      startAt: Date | null;
      duration: number;
      winnerID: string | null;
      rankRecord: RankRecordDTO[];
    }
  | {
      boardSize: number;
    };
