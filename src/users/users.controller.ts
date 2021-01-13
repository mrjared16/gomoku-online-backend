import { Controller, Get, Param } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { LeaderboardResponse, UserDetailResponse } from './users.interface';
import { UserService } from './users.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('leaderboard')
  @ApiResponse({
    status: 200,
    type: LeaderboardResponse,
  })
  async getLeaderboard(): Promise<LeaderboardResponse> {
    const top = 50;
    const users = await this.userService.getLeaderboard(top);
    return {
      leaderboard: {
        users,
      },
    };
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    type: UserDetailResponse,
  })
  async getUser(@Param() id: string): Promise<UserDetailResponse> {
    const user = await this.userService.getUser(id);
    return {
      user,
    };
  }
}
