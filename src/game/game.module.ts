import { Module } from "@nestjs/common";
import { GameGateWay } from "./game.gateway";

@Module({
  providers: [GameGateWay]
})
export class GameModule {

}