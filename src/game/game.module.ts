import { RoomModule } from './../room/room.module';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameEntity } from 'src/game/game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { GameModel } from './game.model';
import { GameGateway } from './game.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameEntity]),
    forwardRef(() => RoomModule),
  ],
  controllers: [GameController],
  providers: [GameService, GameModel, GameGateway],
})
export class GameModule {}
