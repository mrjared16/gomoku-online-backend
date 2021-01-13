import { AuthService } from 'src/auth/auth.service';
import { GameSide, RequestGameDTO } from 'src/game/game.dto';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io/dist/socket';
import { ChatChannelEntity } from 'src/chat/chatChannel.entity';
import { RoomGateway } from 'src/room/room.gateway';
import { RoomManager } from 'src/room/room.model';
import { UserDTO } from 'src/users/users.dto';
import { Repository } from 'typeorm';
import { GameHistoryService } from './../gameHistory/gameHistory.service';
import { TeamEntity } from './../gameHistory/team.entity';
import { RoomModel } from './../room/room.model';
import { RoomService } from './../room/room.service';
import { GameDTO, GameResult, HitDTO } from './game.dto';
import { GameEndingType, GameEntity } from './game.entity';
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
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
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
      this.handleEndGame(room);
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
    const { boardSize, joinedPlayer } = room;

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

  async handleEndGame(room: RoomModel) {
    // save game
    await this.saveGame(room);

    // broadcast game result
    const roomID = room.id;
    const game = room.getGame();
    this.gameGateway.broadcastGameEventToMember(
      null,
      roomID,
      {
        event: 'onFinish',
        data: game.getGameEndResponse(),
      },
      true,
    );

    // reset room
    this.roomService.resetRoomStateWhenGameEnd(room);
  }

  async saveGame(room: RoomModel) {
    const game = room.getGame();
    await this.gameHistoryService.saveGameHistory(game, room);
    await this.gameRepository.save(game.getGameEntity());
  }

  async makeGameEnd(
    room: RoomModel,
    { loser, type }: { loser: UserDTO; type: GameEndingType },
  ) {
    const getGameResult = (): GameResult => {
      if (loser === null) {
        return GameResult.Draw;
      }
      const loserSide = room.getSideOfPlayer(loser);
      const winnerSide = loserSide !== 0 ? GameSide.X : GameSide.O;
      console.log({ players: room.players, loser, loserSide, winnerSide });
      return winnerSide as 0 | 1 | 2;
    };
    await room.getGame().setGameResult(getGameResult(), type);
  }

  async handleRequestGameResult(socket: Socket, requestData: RequestGameDTO) {
    const handleRequestRequest = {
      surrender: async (room: RoomModel, user: UserDTO) => {
        await this.makeGameEnd(room, {
          loser: user,
          type: GameEndingType.surrender,
        });
      },
      tie: async (room: RoomModel, user: UserDTO) => {
        this.gameGateway.broadcastGameEventToMember(
          socket,
          room.id,
          { event: 'onTieRequest', data: {} },
          false,
        );
      },
      onTieAccept: async (room: RoomModel, user: UserDTO) => {
        // TODO: validate is real tie
        await this.makeGameEnd(room, {
          loser: null,
          type: GameEndingType.normal,
        });
      },
    };
    const { data } = requestData;
    const { token, roomID } = data;

    const userInfo = await this.authService.getUser(token);
    if (!userInfo) {
      return;
    }

    const room = this.roomManager.getRoom(roomID);
    await handleRequestRequest[requestData.action](room, userInfo);
  }
}
