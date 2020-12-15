import { Socket } from "socket.io";
import { UserDTO } from "src/users/users.dto";

export class SocketManager {
  constructor() {
    this.map.set('', { user: null, socket: [] });
  }

  map: Map<string, {
    user: UserDTO | null,
    socket: string[]
  }> = new Map();

  getUsers(): UserDTO[] {
    return Array.from(this.map.entries())
      .filter(([key, values]) => key != '')
      .map(([key, values]) => values.user);
  }

  addAnonymousUser(client: Socket) {
    const { id } = client;
    const socket = [...(this.map.get('').socket), id];
    this.map.set('', {
      user: null,
      socket
    });
  }

  removeAnonymousUser(client: Socket) {
    const { id } = client;

    const newSocket = this.map.get('').socket.filter(socket => socket != id);

    this.map.set('', {
      user: null,
      socket: newSocket
    });
  }

  addUser(userData: UserDTO, client: Socket) {
    const { username } = userData;
    const { id } = client;

    const socket = [...(this.map.has(username) ? this.map.get(username).socket : []), id];

    this.map.set(username, {
      user: userData,
      socket
    });
  }

  removeUser(userData: UserDTO, client: Socket) {
    const { username } = userData;
    const { id } = client;

    const current = this.map.get(username);
    const newSocket = current.socket.filter(socket => socket != id);

    if (newSocket.length > 0) {
      this.map.set(username, {
        ...current, socket: newSocket
      })
      return;
    }

    this.map.delete(username);
  }

  didUserOnlineAlready(userData: UserDTO): boolean {
    const { username } = userData;
    return this.map.has(username);
  }
}