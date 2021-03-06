import { GameEndingType, GameEntity } from 'src/game/game.entity';
import { ChatRecordDTO } from 'src/chat/chat.dto';
import { MoveRecordDTO } from 'src/gameHistory/gameHistory.dto';
import { UserDTO } from 'src/users/users.dto';
import { ApiProperty } from '@nestjs/swagger';
export class GomokuGameHistoryPlayer {
  @ApiProperty()
  X: UserDTO;
  @ApiProperty()
  O: UserDTO;
}
export class GameDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  boardSize: number;
  @ApiProperty()
  result: GameResult;
  @ApiProperty()
  startAt: Date;
  @ApiProperty()
  duration: number;

  @ApiProperty({
    type: MoveRecordDTO,
    isArray: true,
  })
  moveRecord: MoveRecordDTO[];
  @ApiProperty({
    type: ChatRecordDTO,
    isArray: true,
  })
  chatRecord: ChatRecordDTO[];

  @ApiProperty()
  players: GomokuGameHistoryPlayer;

  @ApiProperty()
  winningLine: string;
  @ApiProperty()
  gameEndingType: GameEndingType;

  static EntityToDTO(gameEntity: GameEntity): GameDTO {
    const {
      id,
      boardSize,
      gameResult,
      start_at,
      duration,
      moves: moveRecordEntity = [],
      chat,
      team = [],
      winningLine,
      gameEndingType,
    } = gameEntity;
    const moveRecord: MoveRecordDTO[] = moveRecordEntity.map(
      MoveRecordDTO.EntityToDTO,
    );

    const { records: chatRecordEntity = [] } = chat || {};
    const chatRecord: ChatRecordDTO[] = chatRecordEntity.map(
      ChatRecordDTO.EntityToDTO,
    );

    const players: GomokuGameHistoryPlayer = team.reduce(
      (currentPlayers, { users, side }) => {
        const gameSide = side == GameSide.X ? 'X' : 'O';
        if (users.length) {
          currentPlayers[gameSide] = { ...UserDTO.EntityToDTO(users[0]) };
        }
        return currentPlayers;
      },
      { X: null, O: null } as GomokuGameHistoryPlayer,
    );
    return {
      id,
      boardSize,
      result: gameResult,
      startAt: start_at,
      duration,
      moveRecord: moveRecord,
      chatRecord: chatRecord,
      players,
      winningLine: winningLine,
      gameEndingType: gameEndingType,
    };
  }
}

export class Turn {
  @ApiProperty()
  playerID: string;
  @ApiProperty()
  remainingTime: number;
}
export class GameState {
  @ApiProperty()
  move: MoveRecordDTO[];
  @ApiProperty()
  turn: Turn;
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

export type JoinGameDTO = {
  roomID: string;
  gameID: string;
};

export type RequestGameDTO =
  | {
      action: 'surrender';
      data: { roomID: string; gameID: string; token: string };
    }
  | {
      action: 'tie';
      data: { roomID: string; gameID: string; token: string };
    };

export class GomokuGamePlayer {
  @ApiProperty({
    type: UserDTO,
  })
  X: (UserDTO & { online: boolean }) | null;
  @ApiProperty({
    type: UserDTO,
  })
  O: (UserDTO & { online: boolean }) | null;
}

export enum GameSide {
  X,
  O,
}

export enum GameResult {
  X,
  O,
  Draw,
}
