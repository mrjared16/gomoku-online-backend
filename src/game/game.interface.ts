import { RankRecordDTO } from 'src/gameHistory/gameHistory.dto';
import { GameSide, GameState, Turn } from './game.dto';

export type BroadcastGameEventToCurrentRoomResponse =
  | {
      event: 'changeTurn';
      data: {
        turn: Turn;
      };
    }
  | {
      event: 'onHit';
      data: {
        position: number;
        value: GameSide;
      };
    }
  | {
      event: 'onFinish';
      data: {
        winnerID: string;
        duration: number;
        rankRecord: RankRecordDTO[];
        line: number[];
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
