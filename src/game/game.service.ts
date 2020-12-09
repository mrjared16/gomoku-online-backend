import { UserDTO } from 'src/users/users.dto';
import { Injectable } from "@nestjs/common";

@Injectable()
export class GameService {
  map: Map<string, UserDTO> = new Map();

  getUsers(): UserDTO[] {
    return Array.from(this.map.values());
  }

  addUser(userData: UserDTO) {
    const { username } = userData;
    this.map.set(username, userData);
  }

  removeUser(userData: UserDTO) {
    const { username } = userData;
    this.map.delete(username);
  }

  hasUserOnlineAlready(userData: UserDTO): boolean {
    const { username } = userData;
    return this.map.has(username);
  }
}