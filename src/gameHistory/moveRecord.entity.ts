import { UserEntity } from 'src/users/users.entity';
import { Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { GameEntity } from 'src/game/game.entity';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { GameSide } from 'src/game/game.dto';

@Entity('move_record')
export class MoveRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.rankRecords, { cascade: true })
  user: UserEntity;

  @ManyToOne(() => GameEntity, (game) => game.moves)
  game: GameEntity;

  @Column({
    type: 'enum',
    enum: GameSide,
    nullable: false,
  })
  value!: GameSide;

  @Column({ nullable: false })
  position: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
