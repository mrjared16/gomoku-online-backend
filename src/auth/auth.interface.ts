import { UserDTO } from "src/users/users.dto";

export interface RequestWithUser extends Request {
  user: UserDTO;
}

export interface JWTPayload {
  userId: string;
  username: string;
}