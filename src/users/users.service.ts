import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO } from 'src/auth/auth.dto';
import { AuthService } from 'src/auth/auth.service';
import { Config } from 'src/shared/config';
import { comparePassword } from 'src/shared/helper';
import { Repository } from 'typeorm';
import { UserDTO } from './users.dto';
import { UserEntity } from './users.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async createUser(
    userData: CreateUserDTO,
    isAuthenticated = false,
  ): Promise<UserDTO> {
    const {
      email,
      username,
      password,
      firstName,
      lastName,
      photoURL = '',
    } = userData;
    const userWithThisUsername = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (userWithThisUsername) {
      if (userWithThisUsername?.username === username) {
        throw new HttpException(
          'Username already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (userWithThisUsername?.email === email) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }
    }
    const userActiveStatus = isAuthenticated
      ? { activated_at: new Date(), activateCode: null }
      : {
          activated_at: null,
          activateCode: this.authService.createRandomCode(),
        };

    const newUser = this.userRepository.create({
      email,
      username,
      password,
      firstName,
      lastName,
      name: firstName + ' ' + lastName,
      photoURL,
      ...userActiveStatus,
    });
    const userCreated = await this.userRepository.save(newUser);
    if (!isAuthenticated)
      this.authService.sendUserVerificationEmail(email, userCreated);
    return UserDTO.EntityToDTO(userCreated);
  }

  async findUser(userData: Partial<UserEntity>) {
    const user = await this.userRepository.findOne({ where: { ...userData } });
    return UserDTO.EntityToDTO(user);
  }

  async validateUser(username: string, password: string): Promise<UserDTO> {
    const userInfo = await this.userRepository.findOne({ where: { username } });
    if (!userInfo) {
      throw new HttpException('Wrong username or password', 401);
    }

    const isPasswordMatched = await comparePassword(
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

    if (banned_at) {
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

  async getUserEntity(info: {
    id?: string;
    username?: string;
    email?: string;
  }): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ ...info });
    return user;
  }

  async activateUser(token: string) {
    const user = await this.userRepository.findOne({ activateCode: token });
    if (!user) {
      throw new HttpException('Your token is invalid', HttpStatus.NOT_FOUND);
    }

    user.activateCode = null;
    user.activated_at = new Date();
    await this.userRepository.save(user);
    return true;
  }

  async createResetPasswordToken(email: string) {
    const user = await this.getUserEntity({ email });
    if (!user) {
      throw new HttpException(
        'No account with that email address exists.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const resetPasswordTokenExpireTime = Config.getResetPasswordConfig();
    user.resetPasswordToken = this.authService.createRandomCode();
    user.resetPasswordExpires = new Date(
      Date.now() + resetPasswordTokenExpireTime,
    );
    return await this.userRepository.save(user);
  }

  async getResetPasswordUser(token: string): Promise<UserEntity> {
    const response = await this.userRepository
      .createQueryBuilder('user')
      .where('user.resetPasswordToken = :token', { token })
      .andWhere(`user.resetPasswordExpires > :now`, {
        now: new Date().toISOString(),
      })
      .getOne();
    return response;
  }

  async changePassword(user: UserEntity, newPassword: string) {
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    return await this.userRepository.save(user);
  }
}
