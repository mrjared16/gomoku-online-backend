import { Controller, Get, Param } from '@nestjs/common';
import { GameInfoResponse } from './game.interface';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Get('/room/:id')
  async getGameInfo(@Param('id') roomID: string): Promise<GameInfoResponse> {
    return this.gameService.getLiveGameInfo(roomID);
  }
}
