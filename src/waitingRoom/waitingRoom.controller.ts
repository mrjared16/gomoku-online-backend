import { UserDTO } from 'src/users/users.dto';
import { JWTAuthenticationGuard } from '../auth/guards/jwt.guard';
import { WaitingRoomService } from './waitingRoom.service';
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiResponse } from '@nestjs/swagger';

class OnlineUsersResponse {
  users: UserDTO[];
}

@Controller('waitingRoom')
export class WaitingRoomController {
  constructor(
    private waitingRoomService: WaitingRoomService
  ) {

  }

  @Get()
  // @UseGuards(JWTAuthenticationGuard)
  @ApiResponse({
    status: 200,
    type: OnlineUsersResponse
  })
  async getOnlineUsers(): Promise<OnlineUsersResponse> {
    const users = await this.waitingRoomService.getUsers();
    return {
      users
    }
  }

}