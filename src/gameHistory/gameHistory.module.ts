import { ChatModule } from './../chat/chat.module';
import { GameHistoryController } from './gameHistory.controller';
import { GameEntity } from 'src/game/game.entity';
import { GameHistoryService } from './gameHistory.service';
import { UserEntity } from 'src/users/users.entity';
import { RankRecordEntity } from 'src/gameHistory/rankRecord.entity';
import { TeamEntity } from './team.entity';
import { MoveRecordEntity } from 'src/gameHistory/moveRecord.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MoveRecordEntity,
      TeamEntity,
      RankRecordEntity,
      UserEntity,
      GameEntity,
    ]),
    forwardRef(() => ChatModule),
  ],
  providers: [GameHistoryService],
  controllers: [GameHistoryController],
  exports: [GameHistoryService],
})
export class GameHistoryModule {}
