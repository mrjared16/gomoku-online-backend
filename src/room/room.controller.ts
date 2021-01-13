import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { RequestWithUser } from 'src/auth/auth.interface';
import { JWTAuthenticationGuard } from 'src/auth/guards/jwt.guard';
import { JoinRoomDTO, JoinRoomRequestDTO } from './room.dto';
import { AllRoomResponse } from './room.interface';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get()
  @UseGuards(JWTAuthenticationGuard)
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

  @Post('verify')
  @UseGuards(JWTAuthenticationGuard)
  async verifyJoinRoomRequest(
    @Req() request: RequestWithUser,
    @Body() requestData: JoinRoomRequestDTO,
  ) {
    const { user } = request;
    const response = await this.roomService.verifyJoinRoomRequest(
      user,
      requestData,
    );
    if (!response) return;
    return {
      message: 'User can join this room',
    };
  }
}
