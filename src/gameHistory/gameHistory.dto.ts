import { RankRecordEntity } from 'src/gameHistory/rankRecord.entity';
import { MoveRecordEntity } from 'src/gameHistory/moveRecord.entity';
import { GameSide } from './moveRecord.entity';
import { getRepository } from 'typeorm';

export class MoveRecordDTO {
  id: string;
  position: number;
  value: GameSide;
  time: Date;

  static EntityToDTO(moveEntity: MoveRecordEntity): MoveRecordDTO {
    if (moveEntity == null) return null;

    const { id, value, position, created_at } = moveEntity;
    return { id, position, value, time: created_at };
  }
  static DTOToEntity(moveDTO: MoveRecordDTO): MoveRecordEntity {
    const { id, position, value, time } = moveDTO;
    return getRepository(MoveRecordEntity).create({
      position,
      value,
      created_at: time,
    });
  }
}

export class RankRecordDTO {
  gameID: string;
  playerID: string;
  oldRank: number;
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
