import { Controller, Get } from "@nestjs/common";
import { ApiResponse } from '@nestjs/swagger';
import { RoomService } from './room.service';



export class AllRoomResponse {
  rooms: {}[];
}

@Controller('rooms')
export class RoomController {
  constructor(
    private roomService: RoomService
  ) {

  }

  @Get()
  // @UseGuards(JWTAuthenticationGuard)
  @ApiResponse({
    status: 200,
    type: AllRoomResponse
  })
  async getOnlineUsers(): Promise<AllRoomResponse> {
    const rooms = await this.roomService.getAllRoom();
    return {
      rooms: rooms
    }
  }

}