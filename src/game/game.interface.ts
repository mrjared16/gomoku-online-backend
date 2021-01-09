import { ApiResponseProperty } from '@nestjs/swagger';
import { RankRecordDTO, MoveRecordDTO } from 'src/gameHistory/gameHistory.dto';
import { GameSide, GameState, Turn, GameDTO } from './game.dto';

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

export class GameInfoResponse {
  @ApiResponseProperty()
  game: GameDTO;
  @ApiResponseProperty()
  gameState: GameState;
}
