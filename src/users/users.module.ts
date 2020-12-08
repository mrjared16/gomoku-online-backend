import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { Module } from '@nestjs/common';
import { UserEntity } from './users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }