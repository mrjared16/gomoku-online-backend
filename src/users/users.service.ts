import { CreateUserDTO, UserDTO } from './users.dto';
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "./users.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {
  }

  async createUser(userData: CreateUserDTO): Promise<UserDTO> {
    const { username, password, name } = userData;
    const userWithThisUsername = await this.userRepository.findOne({ where: { username } });
    console.log({ userWithThisUsername, userData });
    if (userWithThisUsername != null) {
      throw new HttpException('Username already exists', HttpStatus.BAD_REQUEST);
    }

    const newUser = await this.userRepository.create({ username, password, name });
    const userCreated = await this.userRepository.save(newUser);
    return UserDTO.EntityToDTO(userCreated);
  }
}