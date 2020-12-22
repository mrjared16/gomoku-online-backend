export type RoomOption = {
  time: number;
  password: string | null;
  boardSize: number;
};

export type RoomRequirement = {
  password: string;
} | null;

export type CreateRoomDTO = {
  token: string;
  roomOption: RoomOption;
};

export type JoinRoomDTO = {
  action: 'join';
  token: string;
  roomID: string;
  roomRequirement: RoomRequirement;
};
