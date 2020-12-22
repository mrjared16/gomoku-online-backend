import { GameEntity } from 'src/game/game.entity';
import { GameSide } from 'src/gameHistory/moveRecord.entity';
import { UserEntity } from 'src/users/users.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('team')
export class TeamEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => GameEntity, (game) => game.team)
  game: GameEntity;

  @ManyToMany(() => UserEntity, (user) => user.teams)
  users: UserEntity[];

  @Column({
    type: 'enum',
    enum: GameSide,
    nullable: false,
  })
  side: GameSide;
}
