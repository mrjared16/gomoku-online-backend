import { UserDTO } from './../users/users.dto';

export class BroadcastUserDTO {
  user: UserDTO | 'anonymous';
  event: 'connected' | 'disconnected';
}

export class OnlineUser {
  user: UserDTO | null;
  socket: string[];
  roomID: string;
  isPlayingGame: boolean;
}

export class OnlineUserDTO {
  user: UserDTO | null;
  roomID: string;
  isPlayingGame: boolean;
}

export type InviteDTO = {
  action: 'invite';
  data: {
    token: string;
    username: string;
  };
};

export type LogOutDTO = {
  token: string;
};
