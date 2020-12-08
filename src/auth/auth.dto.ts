import { ApiProperty } from "@nestjs/swagger";

export class UserLoginGoogleOAuthDTO {
  @ApiProperty()
  idToken: string;
}

export class GoogleOAuthResponse {
  email: string;
  name: string;
}