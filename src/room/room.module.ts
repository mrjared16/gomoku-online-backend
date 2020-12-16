import { RoomService } from './room.service';
import { forwardRef, Module } from "@nestjs/common";
import { RoomGateway } from "./room.gateway";
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [],
  providers: [RoomGateway, RoomService]
})
export class RoomModule {

}