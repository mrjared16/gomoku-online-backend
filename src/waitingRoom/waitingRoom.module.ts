import { RoomModule } from './../room/room.module';
import { WaitingRoomController } from './waitingRoom.controller';
import { AuthModule } from '../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { WaitingRoomGateway } from './waitingRoom.gateway';
import { WaitingRoomService } from './waitingRoom.service';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => RoomModule)],
  controllers: [WaitingRoomController],
  providers: [WaitingRoomGateway, WaitingRoomService],
  exports: [WaitingRoomService],
})
export class WaitingRoomModule {}
