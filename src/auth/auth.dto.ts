import { ApiProperty } from '@nestjs/swagger';

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
