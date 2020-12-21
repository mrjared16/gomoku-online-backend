import { UserEntity } from 'src/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatChannelEntity } from './chatChannel.entity';

@Entity('chat_record')
export class ChatRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.chatRecords)
  user: UserEntity;

  @ManyToOne(() => ChatChannelEntity, (channel) => channel.records)
  channel: ChatChannelEntity;

  @Column({ nullable: false })
  content: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
