import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameSide, GomokuGamePlayer } from 'src/game/game.dto';
import { RankRecordEntity } from 'src/gameHistory/rankRecord.entity';
import { RoomModel } from 'src/room/room.model';
import { UserEntity } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { UserService } from './../users/users.service';
import { getNewRank, GetRankData, getUserResult } from './gameHistory.helper';
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
  ) {}

  async createTeamEntity(players: GomokuGamePlayer): Promise<TeamEntity[]> {
    const XPlayer = this.userRepository.create({ ...players.X });
    const OPlayer = this.userRepository.create({ ...players.O });

    const result: TeamEntity[] = [
      this.teamRepository.create({
        users: [XPlayer],
        side: GameSide.X,
      }),
      this.teamRepository.create({
        users: [OPlayer],
        side: GameSide.O,
      }),
    ];
    return result;
  }

  async saveGame(room: RoomModel) {
    // TODO: save chat

    // save moves
    room.getGame().getGameEntity().moves = room
      .getGame()
      .getMoves()
      .map((moveDTO) => {
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

    // TODO: save rank records
    const gameResult = room.getGame().getGameResult();
    const team = room.getGame().getGameEntity().team;

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

    room.getGame().getGameEntity().rankRecords = rankRecord;
  }
}
