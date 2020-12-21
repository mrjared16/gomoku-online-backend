import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './users.entity';

export class CreateUserDTO {
  @ApiProperty()
  name: string;
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
}
export class UserLoginDTO {
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
}
export class UserDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  username: string;
  static EntityToDTO(userEntity: UserEntity): UserDTO {
    if (userEntity == null) return null;

    const { id, name, username } = userEntity;
    return { id, name, username };
  }
}
