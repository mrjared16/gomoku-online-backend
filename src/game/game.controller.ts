import { GameInfoResponse } from './game.dto';
import { GameService } from './game.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Get(':id')
  async getGameInfo(@Param('id') gameID: string): Promise<GameInfoResponse> {
    return this.gameService.getGameInfo(gameID);
  }
}
