import { UserEntity } from 'src/users/users.entity';
import { GameSide, GomokuGamePlayer } from 'src/game/game.dto';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TeamEntity } from './team.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class GameHistoryService {
  constructor(
    @InjectRepository(TeamEntity)
    private teamRepository: Repository<TeamEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
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
    await this.teamRepository.save(result);
    return result;
  }
}
