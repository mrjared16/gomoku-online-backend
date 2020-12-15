import { UserEntity } from "src/users/users.entity";
import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('friend_request')
export class FriendRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, user => user.sentRequests, { primary: true })
  sender: UserEntity;

  @ManyToOne(() => UserEntity, user => user.receivedRequests, { primary: true })
  receiver: UserEntity;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}