import { RoomService } from './../room/room.service';
import { RoomGateway } from './../room/room.gateway';
import { TeamEntity } from './../gameHistory/team.entity';
import { GameSide } from 'src/gameHistory/moveRecord.entity';
import { RoomModel } from './../room/room.model';
import { UserEntity } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io/dist/socket';
import { RoomManager } from 'src/room/room.model';
import { GameGateway } from './game.gateway';
import { GameInfoResponse } from './game.interface';
import { GameModel } from './game.model';
import { GameEntity } from './game.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GameService {
  constructor(
    private roomManager: RoomManager,
    @InjectRepository(GameEntity)
    private gameRepository: Repository<GameEntity>,
    private roomGateway: RoomGateway,
    private roomService: RoomService,
  ) {}
  async getGameInfo(gameID: string): Promise<GameInfoResponse> {
    return null;
  }
  async handleHit(
    gameGateway: GameGateway,
    socket: Socket,
    data: { roomID: string; index: number; value: GameSide },
  ) {
    const { roomID, index, value } = data;
    const room = this.roomManager.getRoom(data.roomID);
    room.gameModel.hit(index, value);
    const isEnd = false;
    if (isEnd) {
      // TODO: handle game end
      this.roomService.handleEndGame(this.roomGateway, room, socket);
      return;
    }
    gameGateway.broadcastGameEventToMember(socket, roomID, {
      event: 'onHit',
      data: {
        index: index,
        value: value,
      },
    });
    gameGateway.broadcastGameEventToMember(
      socket,
      roomID,
      {
        event: 'changeTurn',
        data: {
          currentTurnPlayerID: this.getTurn(room.gameModel),
        },
      },
      true,
    );
  }

  createGame(room: RoomModel): GameModel {
    const { roomOption, players } = room;
    const { boardSize } = roomOption;

    const gameEntity: GameEntity = this.gameRepository.create({
      boardSize,
    });
    return new GameModel(room.roomOption, players, gameEntity);
  }

  saveGame(room: RoomModel): GameModel {
    const { roomOption, players } = room;
    const { boardSize } = roomOption;

    const gameEntity: GameEntity = this.gameRepository.create({
      boardSize,
    });
    return new GameModel(room.roomOption, players, gameEntity);
  }

  getTurn(game: GameModel): string {
    const turn = game.getTurn();
    return game.getPlayers()[turn];
  }
}
