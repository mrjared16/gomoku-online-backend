import { UserDTO } from './../users/users.dto';

export class BroadcastUserDTO {
  user: UserDTO | 'anonymous';
  event: 'connected' | 'disconnected';
}
