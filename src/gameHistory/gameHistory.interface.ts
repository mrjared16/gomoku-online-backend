import { ApiResponseProperty } from '@nestjs/swagger';
import { GameDTO } from './../game/game.dto';
export class GameHistoryDetailResponse {
  @ApiResponseProperty()
  game: GameDTO;
}
