import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Generated, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcryptjs';

@Entity('user')
export abstract class UserEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    unique: true
  })
  username: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await this.hash(this.password);
    }
  }

  private async hash(input): Promise<string> {
    return bcrypt.hash(input, 10);
  }

  public static async comparePassword(rawPassword: string, hashPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, hashPassword);
  }
}