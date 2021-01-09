import { UserDTO } from 'src/users/users.dto';
import { GameHistoryDetailResponse } from './gameHistory.interface';
import { GameHistoryService } from './gameHistory.service';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { GameController } from './../game/game.controller';
import { JWTAuthenticationGuard } from 'src/auth/guards/jwt.guard';
import { RequestWithUser } from 'src/auth/auth.interface';
@Controller('gameHistory')
export class GameHistoryController {
  constructor(private gameHistoryService: GameHistoryService) {}

  @Get('/:id')
  @UseGuards(JWTAuthenticationGuard)
  async getGameHistory(
    @Param('id') gameID: string,
    @Req() requestWithUser: RequestWithUser,
  ): Promise<GameHistoryDetailResponse> {
    const { user } = requestWithUser;
    const result: GameHistoryDetailResponse = await this.gameHistoryService.getGameHistory(
      gameID,
      user as UserDTO,
    );
    return result;
  }
}
