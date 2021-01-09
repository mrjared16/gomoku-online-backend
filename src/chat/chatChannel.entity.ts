import { GameEntity } from '../game/game.entity';
import { UserEntity } from 'src/users/users.entity';
import {
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRecordEntity } from './chatRecord.entity';

@Entity('chat_channel')
export class ChatChannelEntity {
  @ManyToMany(() => UserEntity, (user) => user.chats)
  @JoinTable({
    name: 'chat_participant',
  })
  users: UserEntity[];

  @OneToMany(() => ChatRecordEntity, (record) => record.channel)
  records: ChatRecordEntity[];

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => GameEntity, (game) => game.chat)
  game: GameEntity[];

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
