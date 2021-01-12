import { AuthModule } from './../auth/auth.module';
import { GameHistoryModule } from './../gameHistory/gameHistory.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from 'src/game/game.entity';
import { RoomModule } from './../room/room.module';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameEntity]),
    forwardRef(() => RoomModule),
    forwardRef(() => GameHistoryModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [GameController],
  providers: [GameService, GameGateway],
  exports: [GameService, GameGateway],
})
export class GameModule {}
