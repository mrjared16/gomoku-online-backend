import { RankRecordEntity } from 'src/gameHistory/rankRecord.entity';
import { MoveRecordEntity } from 'src/gameHistory/moveRecord.entity';
import { getRepository } from 'typeorm';
import { GameSide } from 'src/game/game.dto';

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
