import { ApiProperty } from '@nestjs/swagger';

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

export class UserLoginGoogleOAuthDTO {
  @ApiProperty()
  idToken: string;
}

export class GoogleOAuthResponse {
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}

export class ActivateUserDTO {
  token: string;
}
