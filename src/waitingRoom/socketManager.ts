import { Socket } from 'socket.io';
import { UserDTO } from 'src/users/users.dto';

export class SocketManager {
  constructor() {
    this.map.set('', {
      user: null,
      socket: [],
      roomID: null,
      isPlayingGame: false,
    });
  }

  map: Map<
    string,
    {
      user: UserDTO | null;
      socket: string[];
      roomID: string;
      isPlayingGame: boolean;
    }
  > = new Map();

  getUsers(): UserDTO[] {
    return Array.from(this.map.entries())
      .filter(([key, values]) => key != '')
      .map(([key, values]) => values.user);
  }

  addAnonymousUser(client: Socket) {
    const { id } = client;
    const socket = [...this.map.get('').socket, id];
    this.map.set('', {
      user: null,
      socket,
      roomID: null,
      isPlayingGame: false,
    });
  }

  removeAnonymousUser(client: Socket) {
    const { id } = client;

    const newSocket = this.map.get('').socket.filter((socket) => socket != id);

    this.map.set('', {
      user: null,
      socket: newSocket,
      roomID: null,
      isPlayingGame: false,
    });
  }

  addUser(userData: UserDTO, client: Socket): boolean {
    const { username } = userData;
    const { id } = client;
    const isExist = this.map.has(username);
    const socket = [...(isExist ? this.map.get(username).socket : []), id];
    const old = this.map.get(username);
    if (isExist) {
      this.map.set(username, {
        ...old,
        socket: socket,
      });
    } else {
      this.map.set(username, {
        user: userData,
        socket,
        roomID: null,
        isPlayingGame: false,
      });
    }

    return !isExist;
  }

  removeUser(userData: UserDTO, client: Socket, isRemoved: boolean): boolean {
    const { username } = userData;
    const { id } = client;

    const current = this.map.get(username);
    const newSocket = current.socket.filter((socket) => socket != id);

    if (newSocket.length > 0) {
      this.map.set(username, {
        ...current,
        socket: newSocket,
      });
      return false;
    }
    if (isRemoved) {
      this.map.delete(username);
    }
    return true;
  }

  setUserStatus(
    username: string,
    userStatus: { roomID?: string; isPlayingGame?: boolean },
  ) {
    const current = this.map.get(username);
    if (userStatus.roomID !== undefined) {
      current.roomID = userStatus.roomID;
    }
    if (userStatus.isPlayingGame !== undefined) {
      current.isPlayingGame = userStatus.isPlayingGame;
    }
    this.map.set(username, {
      ...current,
    });
  }

  didUserOnlineAlready(userData: UserDTO): boolean {
    const { username } = userData;
    return this.map.has(username);
  }

  getUserStatus(username: string) {
    return this.map.get(username);
  }
}
