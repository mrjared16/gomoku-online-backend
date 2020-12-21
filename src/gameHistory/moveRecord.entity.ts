import { UserEntity } from 'src/users/users.entity';
import { Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { GameEntity } from 'src/game/game.entity';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum GameSide {
  X,
  O,
}

@Entity('move_record')
export class MoveRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.rankRecords)
  user: UserEntity;

  @ManyToOne(() => GameEntity, (game) => game.moves)
  game: GameEntity;

  @Column({
    type: 'enum',
    enum: GameSide,
    nullable: false,
  })
  value: GameSide;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ nullable: false })
  position: number;
}
