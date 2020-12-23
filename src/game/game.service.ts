import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io/dist/socket';
import { RoomGateway } from 'src/room/room.gateway';
import { RoomManager } from 'src/room/room.model';
import { Repository } from 'typeorm';
import { RoomModel } from './../room/room.model';
import { RoomService } from './../room/room.service';
import { HitDTO } from './game.dto';
import { GameEntity } from './game.entity';
import { GameGateway } from './game.gateway';
import { GameInfoResponse } from './game.interface';
import { GameModel } from './game.model';

@Injectable()
export class GameService {
  constructor(
    private roomManager: RoomManager,
    @InjectRepository(GameEntity)
    private gameRepository: Repository<GameEntity>,
    private roomGateway: RoomGateway,
    @Inject(forwardRef(() => RoomService))
    private roomService: RoomService,
  ) {}

  async getLiveGameInfo(roomID: string): Promise<GameInfoResponse> {
    const room = this.roomManager.getRoom(roomID);
    const game = room.getGame();

    if (!game)
      return {
        boardSize: room.roomOption.boardSize,
      };

    const { boardSize } = game;
    return {
      id: game.getGameID(),
      startAt: game.getStartedDate(),
      boardSize,
      duration: null,
      winnerID: null,
      rankRecord: [],
      gameState: {
        move: [],
        turn: {
          playerID: this.getTurn(game),
          remainingTime: 60,
        },
      },
    };
  }

  async handleHit(gameGateway: GameGateway, socket: Socket, data: HitDTO) {
    const { roomID, index, value } = data;
    const room = this.roomManager.getRoom(data.roomID);
    room.getGame().hit(index, value);
    const isEnd = false;
    if (isEnd) {
      // TODO: handle game end
      this.roomService.handleEndGame(this.roomGateway, room, socket);
      return;
    }
    // TODO: fix onHit not broadcast
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
          currentTurnPlayerID: this.getTurn(room.getGame()),
        },
      },
      true,
    );
  }

  async createGame(room: RoomModel): Promise<GameModel> {
    const { roomOption, players } = room;
    const { boardSize } = roomOption;

    const gameEntity: GameEntity = this.gameRepository.create({
      boardSize,
    });
    await this.gameRepository.save(gameEntity);
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
    const side: ('O' | 'X')[] = ['X', 'O'];
    const turnSide: 'X' | 'O' = side[turn];
    return game.getPlayers()[turnSide].id;
  }
}
