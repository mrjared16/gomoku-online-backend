import { GameEntity } from 'src/game/game.entity';
import { ChatRecordDTO } from 'src/chat/chat.dto';
import { MoveRecordDTO } from 'src/gameHistory/gameHistory.dto';
import { UserDTO } from 'src/users/users.dto';

export class GameDTO {
  id: string;
  boardSize: number;
  result: GameResult;
  startAt: Date;
  duration: number;

  moveRecord: MoveRecordDTO[];
  chatRecord: ChatRecordDTO[];
  static EntityToDTO(gameEntity: GameEntity): GameDTO {
    const { id, boardSize, gameResult, start_at, duration } = gameEntity;
    const moveRecord: MoveRecordDTO[] = [];
    const chatRecord: ChatRecordDTO[] = [];
    return {
      id,
      boardSize,
      result: gameResult,
      startAt: start_at,
      duration,
      moveRecord: moveRecord,
      chatRecord: chatRecord,
    };
  }
}

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
  X: (UserDTO & { online: boolean }) | null;
  O: (UserDTO & { online: boolean }) | null;
};

export enum GameSide {
  X,
  O,
}

export enum GameResult {
  X,
  O,
  Draw,
}
