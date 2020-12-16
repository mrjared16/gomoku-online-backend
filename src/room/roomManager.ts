import { Client } from 'socket.io/dist/client';
import { Socket } from 'socket.io/dist/socket';
import { UserDTO } from 'src/users/users.dto';

export class GameModel {
  constructor(size: number) {
    this.board = new Array(size * size).fill(-1);
    this.turn = 0;
  }
  public board: (-1 | 0 | 1)[]
  public turn: number;

  hit(index: number, value: 0 | 1) {
    this.board[index] = value;
    this.turn = (this.turn + 1) % 2;
  }

  isFinish() {
    return false;
  }
  
  getTurn(): 0 | 1 {
    return this.turn as (0 | 1);
  }
}
export class RoomModel {
  constructor(
    public id: string,
    public host: UserDTO,
    public hostSocket: Client,
    public opponent: UserDTO | null = null,
    public boardSize: 20 = 20
  ) {
    this.game = new GameModel(this.boardSize);

  }
  public game: GameModel;

  addUser(user: UserDTO): boolean {
    if (!user || !user.id)
      return false;
    if (this.opponent && user.id != this.host.id && user.id != this.opponent.id) {
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
    return (this.game.getTurn() == 0) ? this.host.id : this.opponent.id;
  }
}
export class RoomManager {
  map: Map<string, RoomModel> = new Map();
  getRoom = (roomID): RoomModel => {
    return this.map.get(roomID);
  }

  addNewRoom(host: UserDTO, hostSocket: Socket): RoomModel {
    const getRoomID = (): string => {
      return (new Date()).toString();
    }
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