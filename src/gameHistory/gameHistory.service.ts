import { GameModel } from 'src/game/game.model';
import { ChatRecordDTO } from 'src/chat/chat.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatService } from 'src/chat/chat.service';
import { GameSide } from 'src/game/game.dto';
import { GameEntity } from 'src/game/game.entity';
import { RankRecordEntity } from 'src/gameHistory/rankRecord.entity';
import { RoomModel } from 'src/room/room.model';
import { UserDTO } from 'src/users/users.dto';
import { UserEntity } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { GameDTO } from './../game/game.dto';
import { GameHistoryDTO, RankRecordDTO } from './gameHistory.dto';
import { getNewRank, GetRankData, getUserResult } from './gameHistory.helper';
import {
  AllGameHistoryResponse,
  GameHistoryDetailResponse,
} from './gameHistory.interface';
import { MoveRecordEntity } from './moveRecord.entity';
import { TeamEntity } from './team.entity';
@Injectable()
export class GameHistoryService {
  constructor(
    @InjectRepository(TeamEntity)
    private teamRepository: Repository<TeamEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(MoveRecordEntity)
    private moveRecordRepository: Repository<MoveRecordEntity>,
    @InjectRepository(RankRecordEntity)
    private rankRecordRepository: Repository<RankRecordEntity>,
    @InjectRepository(GameEntity)
    private gameRepository: Repository<GameEntity>,
    private chatService: ChatService,
  ) {}

  async createTeamEntity(
    players: {
      user: UserDTO;
      side: GameSide;
      online: boolean;
    }[],
  ): Promise<TeamEntity[]> {
    const initalTeamReduce: { side: GameSide; users: UserEntity[] }[] = [
      { side: GameSide.X, users: [] },
      { side: GameSide.O, users: [] },
    ];

    const teamReduce = players.reduce((result, currentPlayer) => {
      const { user, side } = currentPlayer;
      return result.map((team) => {
        if (side !== team.side) {
          return team;
        }
        const { gameProfile, ...updatedUser } = user;
        team.users.push(this.userRepository.create(updatedUser));
        return team;
      });
    }, initalTeamReduce);

    const result: TeamEntity[] = teamReduce.map(({ users, side }) =>
      this.teamRepository.create({
        users,
        side,
      }),
    );

    return result;
  }

  async saveGameHistory(game: GameModel, room: RoomModel) {
    // save moves
    game.getGameEntity().moves = game.getMoves().map((moveDTO) => {
      const { id, position, value, time } = moveDTO;
      const playerID = room.getPlayerOfSide(value);
      const player = this.userRepository.create({ id: playerID });
      return this.moveRecordRepository.create({
        user: player,
        position,
        value,
        created_at: time,
      });
    });

    // save rank records
    const gameResult = game.getGameResult();
    const { team } = await this.gameRepository.findOne({
      where: { id: game.getGameID() },
      relations: ['team', 'team.users'],
    });
    game.getGameEntity().team = team;
    const avgRankOf2Team = new GetRankData(team);

    const rankRecord: RankRecordEntity[] = team.reduce(
      (currentRankRecord, currentTeam) => {
        const { users, side } = currentTeam;

        const currentTeamRankRecord = users.map((currentUser) => {
          const { isDraw, isWon } = getUserResult(side, gameResult);

          const oldRank = currentUser.rank;
          const newRank = getNewRank({
            currentRank: oldRank,
            enemyRank: avgRankOf2Team.getAvgRankOfEnemy(side),
            isDraw,
            isWon,
          });

          currentUser.rank = newRank;
          currentUser.numberOfMatches = currentUser.numberOfMatches + 1;
          if (isWon) {
            currentUser.numberOfWonMatches = currentUser.numberOfWonMatches + 1;
          }

          return this.rankRecordRepository.create({
            user: currentUser,
            oldRank: oldRank,
            newRank: newRank,
          });
        });

        currentRankRecord.push(...currentTeamRankRecord);
        return currentRankRecord;
      },
      [] as RankRecordEntity[],
    );

    game.getGameEntity().rankRecords = rankRecord;
  }

  isInCurrentGame(user: UserDTO, teams: TeamEntity[]) {
    return teams.some(({ users }) => users.some(({ id }) => user.id === id));
  }

  async getGameHistory(
    gameID: string,
    user: UserDTO,
  ): Promise<GameHistoryDetailResponse> {
    const gameEntity = await this.gameRepository.findOne(gameID, {
      relations: ['team', 'team.users', 'moves', 'chat'],
    });
    const { team } = gameEntity;

    if (!this.isInCurrentGame(user, team)) {
      throw new HttpException(
        "You can't view other's game",
        HttpStatus.FORBIDDEN,
      );
    }
    const { start_at, duration, chat: chatChannel } = gameEntity;
    const getChatRecords = async () => {
      if (!chatChannel) {
        return;
      }
      const { id: chatChannelID } = chatChannel;
      const startAt = start_at;
      const endAt = new Date(start_at.getTime() + duration * 1000);

      return await this.chatService.getChatRecordsOfGame({
        chatChannelID,
        startAt,
        endAt,
      });
    };
    const chatRecord: ChatRecordDTO[] = await getChatRecords();
    const gameDTO = GameDTO.EntityToDTO(gameEntity);
    return {
      game: { ...gameDTO, chatRecord: chatRecord || [] },
    };
  }

  async getGameHistoryOfUser(user: UserDTO): Promise<AllGameHistoryResponse> {
    const { id } = user;
    const teamAndRankOfUser = await this.userRepository.findOne(
      { id },
      { relations: ['teams', 'rankRecords', 'rankRecords.game'] },
    );
    const { teams, rankRecords } = teamAndRankOfUser;

    const sideDictionary = teams.reduce((prevDictionary, currentTeamEntity) => {
      const { side, gameId } = currentTeamEntity;

      prevDictionary.set(gameId, side);

      return prevDictionary;
    }, new Map<string, GameSide>());

    const result = rankRecords.map(
      (rankRecord): GameHistoryDTO => {
        const { game } = rankRecord;
        const { id: gameId, start_at, duration, gameResult } = game;

        return {
          id: gameId,
          playerSide: sideDictionary.get(gameId),
          gameResult,
          startAt: start_at,
          duration,
          rankRecord: RankRecordDTO.EntityToDTO(rankRecord),
        };
      },
    );

    return {
      games: result,
    };
  }
}
