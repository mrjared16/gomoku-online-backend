import { UserDTO } from 'src/users/users.dto';
import { JWTAuthenticationGuard } from './../auth/guards/jwt.guard';
import { GameService } from './game.service';
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiResponse } from '@nestjs/swagger';

class OnlineUsersResponse {
  users: UserDTO[];
}

@Controller('game')
export class GameController {
  constructor(
    private gameService: GameService
  ) {

  }

  @Get()
  // @UseGuards(JWTAuthenticationGuard)
  @ApiResponse({
    status: 200,
    type: OnlineUsersResponse
  })
  async getOnlineUsers(): Promise<OnlineUsersResponse> {
    const users = await this.gameService.getUsers();
    return {
      users
    }
  }

}