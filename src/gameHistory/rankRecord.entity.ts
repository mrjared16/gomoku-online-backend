import { GameEntity } from 'src/game/game.entity';
import { UserEntity } from 'src/users/users.entity';
import { Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('rank_record')
export class RankRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, user => user.rankRecords)
  user: UserEntity;

  @ManyToOne(() => GameEntity, game => game.rankRecords)
  game: GameEntity;

  @Column({ nullable: false })
  oldRank: number;

  @Column({ nullable: false })
  newRank: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}