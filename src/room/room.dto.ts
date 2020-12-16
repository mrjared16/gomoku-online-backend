
export class BroadcastRoomEventToAllDTO {
  event: 'newRoomCreated';
  data: {
    room: string;
  };
}

export class BroadcastRoomEventToCurrentRoomDTO {
  event: 'newPlayerJoined';
  data: {
    userId: string;
  }
}

export type CreateRoomDTO = {
  token: string;
}

export type JoinRoomDTO = {
  action: 'join',
  roomID: string,
  token: string
}
