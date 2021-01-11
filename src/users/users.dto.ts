import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './users.entity';

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
