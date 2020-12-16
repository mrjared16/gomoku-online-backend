
export class BroadcastRoomToAllDTO {
  event: 'newRoomCreated';
  data: {
    room: string;
  } | {
    test: string;
  };
}

