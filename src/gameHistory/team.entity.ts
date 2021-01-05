// import { GameSide } from 'src/game/game.dto';
import { GameEntity } from 'src/game/game.entity';
import {} from 'src/gameHistory/moveRecord.entity';
import { UserEntity } from 'src/users/users.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
enum GameSide {
  X,
  O,
}
@Entity('team')
export class TeamEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => GameEntity, (game) => game.team)
  game: GameEntity;

  @ManyToMany(() => UserEntity, (user) => user.teams, { cascade: true })
  users: UserEntity[];

  @Column({
    type: 'enum',
    enum: GameSide,
    nullable: false,
  })
  side: GameSide;
}
