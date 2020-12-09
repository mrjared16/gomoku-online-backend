import { UserDTO } from 'src/users/users.dto';
import { Injectable } from "@nestjs/common";

@Injectable()
export class GameService {
  map: Map<string, {
    user: UserDTO,
    socket: string[]
  }> = new Map();

  getUsers(): UserDTO[] {
    return Array.from(this.map.values()).map(e => e.user);
  }

  addUser(userData: UserDTO, clientId: string) {
    const { username } = userData;
    const socket = [...(this.map.has(username) ? this.map.get(username).socket : []), clientId];
    this.map.set(username, {
      user: userData,
      socket
    });
  }

  removeUser(userData: UserDTO, clientId: string) {
    const { username } = userData;
    const current = this.map.get(username);
    const newSocket = current.socket.filter(socket => socket != clientId);
    if (newSocket.length > 0) {
      this.map.set(username, {
        ...current, socket: newSocket
      })
      return
    }

    this.map.delete(username);
  }

  hasUserOnlineAlready(userData: UserDTO): boolean {
    const { username } = userData;
    return this.map.has(username);
  }
}