import { UserDTO } from 'src/users/users.dto';
import { UserService } from './users.service';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export class UserDetailResponse {
  user: UserDTO;
}

export class LeaderboardResponse {
  leaderboard: {
    users: UserDTO[];
  };
}

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  @ApiResponse({
    status: 200,
    type: UserDetailResponse,
  })
  async getUser(@Param() id: string) {
    const user = await this.userService.getUser(id);
    return {
      user,
    };
  }

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
}
