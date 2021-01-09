import { ApiResponseProperty } from '@nestjs/swagger';
import { UserDTO } from 'src/users/users.dto';

export interface RequestWithUser extends Request {
  user: JWTPayload;
}

export interface JWTPayload {
  id: string;
  username: string;
}

export class LoginResponse {
  @ApiResponseProperty()
  accessToken: string;
}

export class VerifyResponse {
  @ApiResponseProperty()
  user: UserDTO;
}
