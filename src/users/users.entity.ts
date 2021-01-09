import * as bcrypt from 'bcryptjs';
import { ChatChannelEntity } from 'src/chat/chatChannel.entity';
import { ChatRecordEntity } from 'src/chat/chatRecord.entity';
import { FriendParticipantEntity } from 'src/friends/friendParticipant.entity';
import { FriendRequestEntity } from 'src/friends/friendRequest.entity';
import { MoveRecordEntity } from 'src/gameHistory/moveRecord.entity';
import { RankRecordEntity } from 'src/gameHistory/rankRecord.entity';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TeamEntity } from './../gameHistory/team.entity';

@Entity('user')
export abstract class UserEntity {
  @ManyToMany(() => TeamEntity, (team) => team.users)
  @JoinTable({
    name: 'team_participant',
  })
  teams: TeamEntity[];

  @OneToMany(() => MoveRecordEntity, (record) => record.user)
  moveRecords: MoveRecordEntity[];

  @OneToMany(() => RankRecordEntity, (record) => record.user)
  rankRecords: RankRecordEntity[];

  @ManyToMany(() => ChatChannelEntity, (chat) => chat.users)
  chats: ChatChannelEntity[];

  @OneToMany(() => ChatRecordEntity, (record) => record.user)
  chatRecords: ChatRecordEntity[];

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

  @Column({ default: '' })
  firstName: string;

  @Column({ default: '' })
  lastName: string;

  @Column({ default: '' })
  photoURL: string;

  @Column({ default: 1000, type: 'integer', nullable: false })
  rank: number;

  @Column({ default: 0, type: 'integer', nullable: false })
  numberOfMatches: number;

  @Column({ default: 0, type: 'integer', nullable: false })
  numberOfWonMatches: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  private beforeUpdatePassword: string;
  @AfterLoad()
  private loadTempPassword(): void {
    this.beforeUpdatePassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // new password is null and old password not null => password is removed
    if (!this.password && this.beforeUpdatePassword) {
      this.password = this.beforeUpdatePassword;
    }

    if (this.password != null) {
      this.password = await this.hash(this.password);
    }
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
}
