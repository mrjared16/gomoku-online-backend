import { OnlineUserDTO } from './waitingRoom.dto';
import { UserDTO } from 'src/users/users.dto';
import { JWTAuthenticationGuard } from '../auth/guards/jwt.guard';
import { WaitingRoomService } from './waitingRoom.service';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiResponseProperty, ApiProperty } from '@nestjs/swagger';

class OnlineUsersResponse {
  @ApiProperty({
    type: UserDTO,
    isArray: true,
  })
  users: OnlineUserDTO[];
}

@Controller('waitingRoom')
export class WaitingRoomController {
  constructor(private waitingRoomService: WaitingRoomService) {}

  @Get()
  // @UseGuards(JWTAuthenticationGuard)
  @ApiResponse({
    status: 200,
    type: OnlineUsersResponse,
  })
  async getOnlineUsers(): Promise<OnlineUsersResponse> {
    const users = await this.waitingRoomService.getUsers();
    return {
      users,
    };
  }
}
