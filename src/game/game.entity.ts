import { MoveRecordEntity } from 'src/gameHistory/moveRecord.entity';
import { RankRecordEntity } from 'src/gameHistory/rankRecord.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatChannelEntity } from '../chat/chatChannel.entity';
import { TeamEntity } from './../gameHistory/team.entity';
import { DEFAULT_BOARD_SIZE } from './game.constants';
// import { GameResult } from './game.dto';
enum GameResult {
  X,
  O,
  Draw,
}

export enum GameEndingType {
  normal = 'normal',
  timeout = 'timeout',
  surrender = 'surrender',
  quit = 'quit',
}
@Entity('game')
export class GameEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => TeamEntity, (team) => team.game, { cascade: true })
  team: TeamEntity[];

  @OneToMany(() => MoveRecordEntity, (move) => move.game, { cascade: true })
  moves: MoveRecordEntity[];

  @OneToMany(() => RankRecordEntity, (record) => record.game, { cascade: true })
  rankRecords: RankRecordEntity[];

  @ManyToOne(() => ChatChannelEntity, (chat) => chat.game, { cascade: true })
  @JoinColumn()
  chat: ChatChannelEntity;

  @Column({
    type: 'int',
    default: DEFAULT_BOARD_SIZE,
  })
  boardSize: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  start_at: Date;

  @Column({
    type: 'enum',
    enum: GameResult,
    nullable: true,
  })
  gameResult: GameResult;

  @Column({
    nullable: true,
    type: 'float',
  })
  duration: number;

  @Column({
    nullable: true,
    default: null,
  })
  // '1-2-3-4-5', save the winning line
  winningLine: string;

  @Column({
    type: 'enum',
    enum: GameEndingType,
    nullable: true,
    default: GameEndingType.normal,
  })
  gameEndingType: GameEndingType;
}
