import { TeamEntity } from './../gameHistory/team.entity';
import {
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToMany,
  OneToOne,
} from 'typeorm';
import { UserEntity } from 'src/users/users.entity';
import { OneToMany } from 'typeorm';
import { ChatChannelEntity } from '../chat/chatChannel.entity';
import { PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from 'typeorm';
import { RankRecordEntity } from 'src/gameHistory/rankRecord.entity';
import { GameSide, MoveRecordEntity } from 'src/gameHistory/moveRecord.entity';
import { DEFAULT_BOARD_SIZE } from './game.constants';
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
    nullable: false,
  })
  winSide: GameSide;

  @Column({
    type: 'int',
    default: DEFAULT_BOARD_SIZE,
  })
  boardSize: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  start_at: Date;

  @Column()
  duration: number;
}
