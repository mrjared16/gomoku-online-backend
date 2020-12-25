import { GameHistoryService } from './gameHistory.service';
import { UserEntity } from 'src/users/users.entity';
import { RankRecordEntity } from 'src/gameHistory/rankRecord.entity';
import { TeamEntity } from './team.entity';
import { MoveRecordEntity } from 'src/gameHistory/moveRecord.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MoveRecordEntity,
      TeamEntity,
      RankRecordEntity,
      UserEntity,
    ]),
  ],
  providers: [GameHistoryService],
  exports: [GameHistoryService],
})
export class GameHistoryModule {}
