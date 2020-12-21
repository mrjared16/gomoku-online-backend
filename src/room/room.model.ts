import { Injectable } from '@nestjs/common';
import { Client } from 'socket.io/dist/client';
import { Socket } from 'socket.io/dist/socket';
import { GameModel } from 'src/game/game.model';
import { UserDTO } from 'src/users/users.dto';

@Injectable()
export class RoomManager {
  constructor() {
    console.log('room Manager is initialize');
  }
  map: Map<string, RoomModel> = new Map();
  getRoom = (roomID): RoomModel => {
    return this.map.get(roomID);
  };

  addNewRoom(host: UserDTO, hostSocket: Socket): RoomModel {
    const getRoomID = (): string => {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };
    const roomID = getRoomID();
    console.log({ hostSocket });
    const newRoom = new RoomModel(roomID, host, null);
    this.map.set(roomID, newRoom);
    return newRoom;
  }
  getRooms(): RoomModel[] {
    return Array.from(this.map.values());
    // .filter(([key, values]) => key != '')
    // .map(([key, value]) => value);
  }
}

export class RoomModel {
  constructor(
    public id: string,
    public host: UserDTO,
    public hostSocket: Client,
    public opponent: UserDTO | null = null,
    public boardSize: 20 = 20,
  ) {
    this.game = new GameModel(this.boardSize);
  }
  public game: GameModel;

  addUser(user: UserDTO): boolean {
    if (!user || !user.id) return false;
    if (
      this.opponent &&
      user.id != this.host.id &&
      user.id != this.opponent.id
    ) {
      return false;
    }
    if (user.id != this.host.id) {
      this.opponent = user;
    }
    return true;
  }
  hit(index: number, value: 0 | 1) {
    this.game.hit(index, value);
  }
  getTurn(): string {
    return this.game.getTurn() == 0 ? this.host.id : this.opponent.id;
  }
}
