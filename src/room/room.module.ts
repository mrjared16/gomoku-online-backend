import { WaitingRoomModule } from './../waitingRoom/waitingRoom.module';
import { GameModule } from './../game/game.module';
import { RoomService } from './room.service';
import { forwardRef, Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { RoomController } from './room.controller';
import { RoomManager } from './room.model';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => GameModule),
    forwardRef(() => WaitingRoomModule),
  ],
  controllers: [RoomController],
  providers: [RoomService, RoomGateway, RoomManager],
  exports: [RoomGateway, RoomService, RoomManager],
})
export class RoomModule {}
