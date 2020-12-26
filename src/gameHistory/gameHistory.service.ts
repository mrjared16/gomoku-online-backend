import { MoveRecordEntity } from './moveRecord.entity';
import { RankRecordEntity } from 'src/gameHistory/rankRecord.entity';
import { UserEntity } from 'src/users/users.entity';
import { GameSide, GomokuGamePlayer } from 'src/game/game.dto';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TeamEntity } from './team.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomModel } from 'src/room/room.model';
@Injectable()
export class GameHistoryService {
  constructor(
    @InjectRepository(TeamEntity)
    private teamRepository: Repository<TeamEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(MoveRecordEntity)
    private moveRecordRepository: Repository<MoveRecordEntity>,
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
    const rankRecord: RankRecordEntity[] = [];
    room.getGame().getGameEntity().rankRecords = rankRecord;
  }
}
