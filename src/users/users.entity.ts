import { TeamEntity } from './../gameHistory/team.entity';
import * as bcrypt from 'bcryptjs';
import { ChatChannelEntity } from 'src/chat/chatChannel.entity';
import { ChatRecordEntity } from 'src/chat/chatRecord.entity';
import { FriendParticipantEntity } from 'src/friends/friendParticipant.entity';
import { FriendRequestEntity } from 'src/friends/friendRequest.entity';
import { GameEntity } from 'src/game/game.entity';
import { MoveRecordEntity } from 'src/gameHistory/moveRecord.entity';
import { RankRecordEntity } from 'src/gameHistory/rankRecord.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user')
export abstract class UserEntity {
  @OneToMany(() => FriendRequestEntity, (friendRequest) => friendRequest.sender)
  sentRequests: FriendRequestEntity[];

  @OneToMany(
    () => FriendRequestEntity,
    (friendRequest) => friendRequest.receiver,
  )
  receivedRequests: FriendRequestEntity[];

  @OneToMany(() => FriendParticipantEntity, (friend) => friend.user1)
  friendList1: FriendParticipantEntity[];

  @OneToMany(() => FriendParticipantEntity, (friend) => friend.user2)
  friendList2: FriendParticipantEntity[];

  @OneToMany(() => ChatRecordEntity, (record) => record.user)
  chatRecords: ChatRecordEntity[];

  @ManyToMany(() => ChatChannelEntity, (chat) => chat.users)
  chats: ChatChannelEntity[];

  @ManyToMany(() => TeamEntity, (team) => team.users)
  @JoinTable({
    name: 'team_participant',
  })
  teams: TeamEntity[];

  @OneToMany(() => RankRecordEntity, (record) => record.user)
  rankRecords: RankRecordEntity[];

  @OneToMany(() => MoveRecordEntity, (record) => record.user)
  moveRecords: MoveRecordEntity[];

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    unique: true,
  })
  username: string;

  @Column({
    nullable: true,
  })
  password: string;

  @Column()
  name: string;

  @Column({ default: 1000 })
  rank: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await this.hash(this.password);
    } else this.password = '';
  }

  private async hash(input): Promise<string> {
    return bcrypt.hash(input, 10);
  }

  public static async comparePassword(
    rawPassword: string,
    hashPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(rawPassword, hashPassword);
  }
}
