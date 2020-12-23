import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io/dist/socket';
import { GomokuGamePlayer, Turn } from 'src/game/game.dto';
import { GameEntity } from 'src/game/game.entity';
import { GameModel } from 'src/game/game.model';
import { GameSide } from 'src/gameHistory/moveRecord.entity';
import { UserDTO } from 'src/users/users.dto';
import { GameService } from './../game/game.service';
import { DEFAULT_ROOM_OPTION } from './room.constants';
import { RoomOption, RoomRequirement } from './room.dto';

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
    const newRoom = new RoomModel(roomID, host);
    this.map.set(roomID, newRoom);
    return newRoom;
  }

  getRooms(): RoomModel[] {
    return Array.from(this.map.values());
  }
}

export class RoomModel {
  constructor(
    public id: string,
    public host: UserDTO,
    public roomOption: RoomOption = DEFAULT_ROOM_OPTION,
  ) {
    const { boardSize, password, time } = roomOption;
    this.time = time;
    this.boardSize = boardSize;
    this.password = password;

    this.players = {
      X: null,
      O: null,
    };
    this.users = [];
    this.gameID = null;
  }

  private password: string;
  private boardSize: number;
  private time: number;

  public players: GomokuGamePlayer;
  users: UserDTO[];

  public gameID: string | null;
  private gameModel: GameModel;

  addUser(user: UserDTO, roomRequirement: RoomRequirement): boolean {
    if (roomRequirement) {
      console.log({ roomRequirement });
      const { password } = roomRequirement;
      if (this.password !== password) return false;
    }
    const isExist = this.users.some((inRoomUser) => inRoomUser.id === user.id);
    if (!isExist) {
      this.users.push(user);
      // TO DO: game ready manual
      if (!this.players.X) {
        this.players.X = user;
      } else if (!this.players.O) {
        this.players.O = user;
      }
    }
    return true;
  }

  setPlayer(user: UserDTO, gameSide: GameSide): boolean {
    //TODO: refactor gameside
    if (this.players[gameSide.toString()]) return false;
    this.players[gameSide.toString()] = user;
    return true;
  }

  kickPlayer(user: UserDTO): boolean {
    // TODO: refactor
    const gameSide = [GameSide.O.toString(), GameSide.X.toString()].find(
      (team: 'X' | 'O') => this.players[team].id === user.id,
    );
    if (!gameSide) return false;
    this.players[gameSide] = null;
    return true;
  }

  async startGame(gameService: GameService) {
    this.gameModel = await gameService.createGame(this);
    this.gameID = this.gameModel.getGameID();
    return this.gameID;
  }

  endGame() {
    this.gameModel = null;
    this.gameID = null;
  }

  save() {
    //TODO: handle save game
  }

  getGame() {
    return this.gameModel;
  }

  getGameTurn(): Turn {
    const turn = this.gameModel.getTurn();
    return {
      playerID: this.getPlayerOfSide(turn),
      remainingTime: this.gameModel.getRemainingTime(),
    };
  }

  getPlayerOfSide(gameSide: GameSide): string {
    const side: ('O' | 'X')[] = ['X', 'O'];
    const turnSide: 'X' | 'O' = side[gameSide];
    return this.gameModel.getPlayers()[turnSide].id;
  }
}
