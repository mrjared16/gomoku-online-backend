import { CreateUserDTO, UserDTO } from './users.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './users.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async createUser(userData: CreateUserDTO): Promise<UserDTO> {
    const {
      email,
      username,
      password,
      firstName,
      lastName,
      photoURL = '',
    } = userData;
    const userWithThisUsername = await this.userRepository.findOne({
      where: { username },
    });
    if (userWithThisUsername != null) {
      throw new HttpException(
        'Username already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newUser = await this.userRepository.create({
      email,
      username,
      password,
      firstName,
      lastName,
      photoURL,
    });
    const userCreated = await this.userRepository.save(newUser);
    return UserDTO.EntityToDTO(userCreated);
  }

  async findUser(userData: Partial<UserEntity>) {
    // const { name, username, id } = userData;
    // TODO: get fields properly
    const user = await this.userRepository.findOne({ where: { ...userData } });
    return UserDTO.EntityToDTO(user);
  }

  async validateUser(username: string, password: string): Promise<UserDTO> {
    const userInfo = await this.userRepository.findOne({ where: { username } });
    if (!userInfo) {
      throw new HttpException('Wrong username or password', 401);
    }

    const isPasswordMatched = await UserEntity.comparePassword(
      password,
      userInfo.password,
    );
    if (!isPasswordMatched) {
      throw new HttpException('Wrong username or password', 401);
    }

    const { banned_at, activated_at } = userInfo;
    if (!activated_at) {
      throw new HttpException(
        'Your account has not been activated yet',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!banned_at) {
      throw new HttpException(
        'Your account has been banned',
        HttpStatus.FORBIDDEN,
      );
    }

    return UserDTO.EntityToDTO(userInfo);
  }

  async getUser(id: string): Promise<UserDTO> {
    const user = await this.userRepository.findOne(id);
    return UserDTO.EntityToDTO(user);
  }

  async getLeaderboard(
    top = 50,
  ): Promise<{ rankIndex: number; user: UserDTO }[]> {
    const topProfile = await this.userRepository.find({
      take: top,
      order: {
        rank: 'DESC',
      },
    });
    return topProfile.map((user, index) => ({
      user: UserDTO.EntityToDTO(user),
      rankIndex: index + 1,
    }));
  }
}
