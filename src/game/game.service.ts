import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io/dist/socket';
import { RoomGateway } from 'src/room/room.gateway';
import { RoomManager } from 'src/room/room.model';
import { Repository } from 'typeorm';
import { GameHistoryService } from './../gameHistory/gameHistory.service';
import { TeamEntity } from './../gameHistory/team.entity';
import { RoomModel } from './../room/room.model';
import { RoomService } from './../room/room.service';
import { GameResult, HitDTO } from './game.dto';
import { GameEntity } from './game.entity';
import { GameGateway } from './game.gateway';
import { GameInfoResponse } from './game.interface';

@Injectable()
export class GameService {
  constructor(
    private roomManager: RoomManager,
    @InjectRepository(GameEntity)
    private gameRepository: Repository<GameEntity>,
    private roomGateway: RoomGateway,
    @Inject(forwardRef(() => RoomService))
    private roomService: RoomService,
    private gameHistoryService: GameHistoryService,
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
      await this.saveGame(room);

      gameGateway.broadcastGameEventToMember(
        socket,
        roomID,
        {
          event: 'onFinish',
          data: {
            winnerID:
              game.getGameResult() != GameResult.Draw
                ? room.getPlayerOfSide(game.getGameResult() as 0 | 1)
                : null,
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

  async createGameEntity(room: RoomModel): Promise<GameEntity> {
    const { roomOption, players } = room;
    const { boardSize } = roomOption;

    const team: TeamEntity[] = await this.gameHistoryService.createTeamEntity(
      players,
    );

    // TODO: create chat

    const gameEntity: GameEntity = this.gameRepository.create({
      boardSize,
      team: team,
    });
    return await this.gameRepository.save(gameEntity);
  }

  async saveGame(room: RoomModel) {
    room.getGame().saveGameState();
    await this.gameHistoryService.saveGame(room);
    await this.gameRepository.save(room.getGame().getGameEntity());
  }
}
