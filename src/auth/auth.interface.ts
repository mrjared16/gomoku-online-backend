import { ApiResponseProperty } from "@nestjs/swagger";
import { UserDTO } from "src/users/users.dto";

export interface RequestWithUser extends Request {
  user: UserDTO;
}

export interface JWTPayload {
  userId: string;
  username: string;
}

export class LoginResponse {
  @ApiResponseProperty()
  accessToken: string;
}