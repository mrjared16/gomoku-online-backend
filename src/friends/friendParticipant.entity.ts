import { UserEntity } from 'src/users/users.entity';
import { BeforeInsert, BeforeUpdate, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('friend_participant')
export class FriendParticipantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, user => user.friendList1, { primary: true })
  user1: UserEntity;

  @ManyToOne(() => UserEntity, user => user.friendList2, { primary: true })
  user2: UserEntity;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  user1IdLowerThenUser2IdConstraint() {
    if (this.user1.id > this.user2.id) {
      const tmp = this.user1.id;
      this.user1.id = this.user2.id;
      this.user2.id = tmp;
    }
  }
}