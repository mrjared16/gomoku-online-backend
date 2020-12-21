import { Injectable } from '@nestjs/common';
import { GameInfoResponse } from './game.dto';
@Injectable()
export class GameService {
  async getGameInfo(gameID: string): Promise<GameInfoResponse> {
    return null;
  }
}
