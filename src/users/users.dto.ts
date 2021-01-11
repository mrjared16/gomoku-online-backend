import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './users.entity';

export class CreateUserDTO {
  @ApiProperty()
  username: string;
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  photoURL?: string;
}
export class UserLoginDTO {
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
}
export class GameProfile {
  @ApiProperty()
  rank: number;
  @ApiProperty()
  numberOfMatches: number;
  @ApiProperty()
  numberOfWonMatches: number;
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
  gameProfile: GameProfile;
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
      name: firstName + lastName,
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
}
