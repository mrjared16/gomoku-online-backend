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

export class UserLoginFacebookOAuthDTO {
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

export class FacebookOAuthResponse {
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  picture: {
    data: {
      url: string;
    };
  };
}

export class ActivateUserDTO {
  token: string;
}

export class ForgotPasswordDTO {
  email: string;
}
export class ChangePasswordDTO {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}
