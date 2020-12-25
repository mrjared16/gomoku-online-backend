import { MoveRecordEntity } from 'src/gameHistory/moveRecord.entity';
import { RankRecordEntity } from 'src/gameHistory/rankRecord.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatChannelEntity } from '../chat/chatChannel.entity';
import { TeamEntity } from './../gameHistory/team.entity';
import { DEFAULT_BOARD_SIZE } from './game.constants';
enum GameSide {
  X,
  O,
}
@Entity('game')
export class GameEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => TeamEntity, (team) => team.game)
  team: TeamEntity[];

  @OneToMany(() => MoveRecordEntity, (move) => move.game)
  moves: MoveRecordEntity[];

  @OneToMany(() => RankRecordEntity, (record) => record.game)
  rankRecords: RankRecordEntity[];

  @OneToOne(() => ChatChannelEntity, (chat) => chat.game)
  @JoinColumn()
  chat: ChatChannelEntity;

  @Column({
    type: 'enum',
    enum: GameSide,
    nullable: true,
  })
  winSide!: GameSide;

  @Column({
    type: 'int',
    default: DEFAULT_BOARD_SIZE,
  })
  boardSize: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  start_at: Date;

  @Column({
    nullable: true,
  })
  duration: number;
}
