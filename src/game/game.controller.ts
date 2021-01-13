import { Controller, Get, Param } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { GameInfoResponse } from './game.interface';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Get('/room/:id')
  @ApiResponse({
    status: 200,
    type: GameInfoResponse,
  })
  async getGameInfo(@Param('id') roomID: string): Promise<GameInfoResponse> {
    return this.gameService.getLiveGameInfo(roomID);
  }
}
