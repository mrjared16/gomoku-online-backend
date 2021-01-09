import { UserDTO } from 'src/users/users.dto';
import { RankRecordEntity } from 'src/gameHistory/rankRecord.entity';
import { MoveRecordEntity } from 'src/gameHistory/moveRecord.entity';
import { getRepository } from 'typeorm';
import { GameSide } from 'src/game/game.dto';
import { ApiProperty } from '@nestjs/swagger';

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
      playerID: user.id,
      gameID: game.id,
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
