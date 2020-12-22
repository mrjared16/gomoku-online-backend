import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AllRoomResponse } from './room.interface';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get()
  // @UseGuards(JWTAuthenticationGuard)
  @ApiResponse({
    status: 200,
    type: AllRoomResponse,
  })
  async getOnlineUsers(): Promise<AllRoomResponse> {
    const rooms = await this.roomService.getAllRoom();
    return {
      rooms: rooms,
    };
  }
}
