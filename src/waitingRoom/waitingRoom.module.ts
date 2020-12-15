import { WaitingRoomController } from './waitingRoom.controller';
import { AuthModule } from '../auth/auth.module';
import { forwardRef, Module } from "@nestjs/common";
import { WaitingRoomGateway } from "./waitingRoom.gateway";
import { WaitingRoomService } from './waitingRoom.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [WaitingRoomController],
  providers: [WaitingRoomGateway, WaitingRoomService]
})
export class GameModule {

}