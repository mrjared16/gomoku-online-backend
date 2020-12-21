import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameEntity } from 'src/game/game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([GameEntity])],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
