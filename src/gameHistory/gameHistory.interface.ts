import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { GameDTO } from './../game/game.dto';
import { GameHistoryDTO } from './gameHistory.dto';
export class GameHistoryDetailResponse {
  @ApiResponseProperty()
  game: GameDTO;
}

export class AllGameHistoryResponse {
  @ApiProperty({
    type: GameHistoryDTO,
    isArray: true,
  })
  games: GameHistoryDTO[];
}
