import { Module } from "@nestjs/common";
import { RoomGateWay } from "./room.gateway";


@Module({
  imports: [],
  controllers: [],
  providers: [RoomGateWay]
})
export class RoomModule {

}