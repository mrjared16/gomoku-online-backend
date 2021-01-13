import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('admin')
export abstract class AdminEntity {
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

  @Column({ nullable: false })
  name: string;

  @Column({ default: '' })
  firstName: string;

  @Column({ default: '' })
  lastName: string;

  @Column({ default: '' })
  photoURL: string;

  @Column({
    nullable: true,
    unique: true,
  })
  email: string;

  @Column({
    nullable: true,
    default: null,
  })
  resetPasswordToken: string;

  @CreateDateColumn({
    nullable: true,
    default: null,
  })
  resetPasswordExpires: Date;

  @CreateDateColumn({
    nullable: true,
    default: null,
  })
  banned_at: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
