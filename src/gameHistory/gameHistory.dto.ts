import { ApiProperty } from '@nestjs/swagger';
import { GameResult, GameSide } from 'src/game/game.dto';
import { MoveRecordEntity } from 'src/gameHistory/moveRecord.entity';
import { RankRecordEntity } from 'src/gameHistory/rankRecord.entity';
import { UserDTO } from 'src/users/users.dto';

export class MoveRecordDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  position: number;
  @ApiProperty()
  value: GameSide;
  @ApiProperty()
  time: Date;

  static EntityToDTO(moveEntity: MoveRecordEntity): MoveRecordDTO {
    if (moveEntity == null) return null;

    const { id, value, position, created_at } = moveEntity;
    return { id, position, value, time: created_at };
  }
}

export class RankRecordDTO {
  @ApiProperty()
  gameID: string;
  @ApiProperty()
  playerID: string;
  @ApiProperty()
  oldRank: number;
  @ApiProperty()
  newRank: number;

  static EntityToDTO(rankEntity: RankRecordEntity): RankRecordDTO {
    if (rankEntity == null) return null;

    const { user, game, oldRank, newRank } = rankEntity;
    return {
      playerID: user?.id,
      gameID: game?.id,
      oldRank,
      newRank,
    };
  }
}

export class TeamDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  side: GameSide;
  @ApiProperty()
  users: UserDTO[];
}

export class GameHistoryDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  playerSide: GameSide;
  @ApiProperty()
  gameResult: GameResult;
  @ApiProperty()
  startAt: Date;
  @ApiProperty()
  duration: number;
  @ApiProperty()
  rankRecord: RankRecordDTO;
}
