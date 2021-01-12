import { ApiResponseProperty } from '@nestjs/swagger';
import { RankRecordDTO, MoveRecordDTO } from 'src/gameHistory/gameHistory.dto';
import { GameSide, GameState, Turn, GameDTO, GameResult } from './game.dto';
import { GameEndingType } from './game.entity';

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
      data: GameEndResponse;
    }
  | {
      event: 'onTieRequest';
      data: {};
    };

export class GameInfoResponse {
  @ApiResponseProperty()
  game: GameDTO;
  @ApiResponseProperty()
  gameState: GameState;
}

export class GameEndResponse {
  winningLine: string;
  gameResult: GameResult;
  gameEndingType: GameEndingType;

  duration: number;
  rankRecords: RankRecordDTO[];
}
