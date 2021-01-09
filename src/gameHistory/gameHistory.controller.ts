import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RequestWithUser } from 'src/auth/auth.interface';
import { JWTAuthenticationGuard } from 'src/auth/guards/jwt.guard';
import { UserDTO } from 'src/users/users.dto';
import {
  AllGameHistoryResponse,
  GameHistoryDetailResponse,
} from './gameHistory.interface';
import { GameHistoryService } from './gameHistory.service';
@Controller('gameHistory')
export class GameHistoryController {
  constructor(private gameHistoryService: GameHistoryService) {}

  @Get('/:id')
  @UseGuards(JWTAuthenticationGuard)
  @ApiResponse({
    status: 200,
    type: GameHistoryDetailResponse,
  })
  @ApiBearerAuth()
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

  @Get()
  @UseGuards(JWTAuthenticationGuard)
  @ApiResponse({
    status: 200,
    type: AllGameHistoryResponse,
  })
  @ApiBearerAuth()
  async getGameHistoryOfUser(
    @Req() requestWithUser: RequestWithUser,
  ): Promise<AllGameHistoryResponse> {
    const { user } = requestWithUser;
    const result: AllGameHistoryResponse = await this.gameHistoryService.getGameHistoryOfUser(
      user as UserDTO,
    );
    return result;
  }
}
