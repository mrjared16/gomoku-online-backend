import { GameController } from './game.controller';
import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from "@nestjs/common";
import { GameGateWay } from "./game.gateway";
import { GameService } from './game.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [GameController],
  providers: [GameGateWay, GameService]
})
export class GameModule {

}