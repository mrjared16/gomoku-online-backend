import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io/dist/socket';
import { ChatChannelEntity } from 'src/chat/chatChannel.entity';
import { RoomGateway } from 'src/room/room.gateway';
import { RoomManager } from 'src/room/room.model';
import { Repository } from 'typeorm';
import { GameHistoryService } from './../gameHistory/gameHistory.service';
import { TeamEntity } from './../gameHistory/team.entity';
import { RoomModel } from './../room/room.model';
import { RoomService } from './../room/room.service';
import { GameDTO, GameResult, HitDTO } from './game.dto';
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
    @Inject(forwardRef(() => GameGateway))
    private gameGateway: GameGateway,
    private gameHistoryService: GameHistoryService,
  ) {}

  async getLiveGameInfo(roomID: string): Promise<GameInfoResponse> {
    const room = this.roomManager.getRoom(roomID);
    const game = room.getGame();

    if (!game) {
      return null;
    }

    const gameDTO = GameDTO.EntityToDTO(game.getGameEntity());
    return {
      game: gameDTO,
      gameState: {
        move: game.getMoves(),
        turn: room.getGameTurn(),
      },
    };
  }

  async handleHit(socket: Socket, data: HitDTO) {
    const { roomID, position, value } = data;

    const room = this.roomManager.getRoom(data.roomID);
    const game = room.getGame();

    const canHit = game.hit(position, value);

    if (!canHit) {
      // TODO: handle invalid hit
      return;
    }

    this.gameGateway.broadcastGameEventToMember(socket, roomID, {
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

      this.gameGateway.broadcastGameEventToMember(
        socket,
        roomID,
        {
          event: 'onFinish',
          data: game.getGameEndResponse(),
        },
        true,
      );
      this.roomService.handleEndGame(room, socket);
    } else {
      this.gameGateway.broadcastGameEventToMember(
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
  }

  async createGameEntity(room: RoomModel): Promise<GameEntity> {
    const { roomOption, joinedPlayer } = room;
    const { boardSize } = roomOption;

    const team: TeamEntity[] = await this.gameHistoryService.createTeamEntity(
      joinedPlayer,
    );

    const chat: ChatChannelEntity = room.getChatChannelEntity();

    const gameEntity: GameEntity = this.gameRepository.create({
      boardSize,
      team: team,
      chat,
    });
    const result = await this.gameRepository.save(gameEntity);
    return result;
  }

  async saveGame(room: RoomModel) {
    room.getGame().saveGameState();
    await this.gameHistoryService.saveGame(room);
    await this.gameRepository.save(room.getGame().getGameEntity());
  }
}
