import { UserEntity } from "./users.entity";

export class CreateUserDTO {
  name: string;
  username: string;
  password: string;
}

export class UserDTO {
  id: string;
  name: string;
  username: string;
  static EntityToDTO(userEntity: UserEntity): UserDTO {
    if (userEntity == null)
      return null;

    const { id, name, username } = userEntity;
    return { id, name, username };
  }
}