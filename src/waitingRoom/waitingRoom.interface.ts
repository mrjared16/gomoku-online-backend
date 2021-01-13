import { UserDTO } from 'src/users/users.dto';

export type InviteRoomResponse = {
  event: 'invite';
  data: {
    roomID: string;
    host: UserDTO;
  };
};
