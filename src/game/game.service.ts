import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io/dist/socket';
import { GameSide } from 'src/gameHistory/moveRecord.entity';
import { RoomGateway } from 'src/room/room.gateway';
import { RoomManager } from 'src/room/room.model';
import { Repository } from 'typeorm';
import { RoomModel } from './../room/room.model';
import { RoomService } from './../room/room.service';
import { HitDTO, Turn } from './game.dto';
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
        move: game.getMoves(),
        turn: room.getGameTurn(),
      },
    };
  }

  async handleHit(gameGateway: GameGateway, socket: Socket, data: HitDTO) {
    const { roomID, position, value } = data;

    const room = this.roomManager.getRoom(data.roomID);
    const game = room.getGame();

    const canHit = game.hit(position, value);

    if (!canHit) {
      // TODO: handle invalid hit
      return;
    }

    gameGateway.broadcastGameEventToMember(socket, roomID, {
      event: 'onHit',
      data: {
        position: position,
        value: value,
      },
    });

    const isFinish = game.isFinish();
    if (isFinish) {
      // TODO: handle game end
      game.saveGameState();
      gameGateway.broadcastGameEventToMember(
        socket,
        roomID,
        {
          event: 'onFinish',
          data: {
            winnerID: room.getPlayerOfSide(game.getWinSide()),
            duration: game.getDuration(),
            rankRecord: game.getRankRecord(),
            line: game.getWinLine(),
          },
        },
        true,
      );
      this.roomService.handleEndGame(this.roomGateway, room, socket);
      return;
    }

    gameGateway.broadcastGameEventToMember(
      socket,
      roomID,
      {
        event: 'changeTurn',
        data: {
          turn: room.getGameTurn(),
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
}
