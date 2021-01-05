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
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  gameProfile: {
    rank: number;
    numberOfMatches: number;
    numberOfWonMatches: number;
  };
  @ApiProperty()
  joinDate: Date;
  @ApiProperty()
  photoURL: string;

  static EntityToDTO(userEntity: UserEntity): UserDTO {
    if (userEntity == null) return null;

    const {
      id,
      name,
      username,
      rank,
      numberOfMatches,
      numberOfWonMatches,
      created_at,
      firstName,
      lastName,
      photoURL,
    } = userEntity;
    return {
      id,
      name,
      username,
      gameProfile: {
        rank,
        numberOfMatches,
        numberOfWonMatches,
      },
      joinDate: created_at,
      firstName,
      lastName,
      photoURL,
    };
  }

  static toEntity(user: UserDTO): Partial<UserEntity> {
    const { id, name, username, gameProfile } = user;
    const { rank, numberOfMatches, numberOfWonMatches } = gameProfile;
    return {
      id,
      name,
      username,
      rank,
      numberOfMatches,
      numberOfWonMatches,
    };
  }
}
