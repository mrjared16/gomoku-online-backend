import { ChatChannelEntity } from 'src/chat/chatChannel.entity';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io/dist/socket';
import { GameSide, GomokuGamePlayer, Turn } from 'src/game/game.dto';
import { GameModel } from 'src/game/game.model';
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

  addNewRoom(host: UserDTO, chatChannel: ChatChannelEntity): RoomModel {
    const getRoomID = (): string => {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };
    const roomID = getRoomID();
    const newRoom = new RoomModel(roomID, host, chatChannel);
    this.map.set(roomID, newRoom);
    return newRoom;
  }

  removeRoom(roomID: string): boolean {
    this.map.delete(roomID);
    return true;
  }

  getRooms(): RoomModel[] {
    return Array.from(this.map.values());
  }
}

export class RoomModel {
  constructor(
    public id: string,
    public host: UserDTO,
    private chatChannelEntity: ChatChannelEntity,
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

    this.joinedPlayer = [];
    this.users = [];
    this.gameID = null;
    this.chatChannelID = this.chatChannelEntity?.id || null;
  }

  private password: string;
  private boardSize: number;
  private time: number;

  public players: GomokuGamePlayer;
  users: UserDTO[];
  joinedPlayer: {
    user: UserDTO;
    side: GameSide;
    online: boolean;
  }[];

  public gameID: string | null;
  private gameModel: GameModel;

  public chatChannelID: string;

  addUser(user: UserDTO, roomRequirement: RoomRequirement): boolean {
    if (roomRequirement) {
      console.log({ roomRequirement });
      const { password } = roomRequirement;
      if (this.password !== password) return false;
    }
    const isExist = this.users.some((inRoomUser) => inRoomUser.id === user.id);
    if (!isExist) {
      this.users.push(user);

      const isReconnect = this.joinedPlayer.some(
        (joinedPlayer) => joinedPlayer.user.id === user.id,
      );
      if (isReconnect) {
        this.setPlayerOnlineStatus(user.id, true);
      }
    }
    return true;
  }

  removeUser(userId: string): boolean {
    this.users = this.users.filter((user) => user.id !== userId);
    return true;
  }

  removePlayer(userId: string) {
    this.joinedPlayer = this.joinedPlayer.filter(
      ({ user }) => user.id !== userId,
    );
    this.resetPlayer();
  }

  setPlayerOnlineStatus(userId: string, onlineStatus: boolean) {
    this.joinedPlayer = this.joinedPlayer.map((joinedPlayer) => {
      const { user } = joinedPlayer;
      if (user.id !== userId) {
        return joinedPlayer;
      }
      return {
        ...joinedPlayer,
        online: onlineStatus,
      };
    });
    this.resetPlayer();
  }

  resetPlayer() {
    this.players = {
      X: null,
      O: null,
    };
    this.joinedPlayer.forEach(({ user, side, online }) => {
      const gameSide = side == GameSide.X ? 'X' : 'O';
      this.players[gameSide] = { ...user, online };
    });
  }

  setPlayer(newUser: UserDTO, gameSide: GameSide): boolean {
    // already taken
    if (this.joinedPlayer.some(({ side }) => side == gameSide)) {
      return false;
    }

    let newJoinedPlayer = this.joinedPlayer.filter(
      ({ user }) => user.id !== newUser.id,
    );

    if (gameSide != null) {
      // full
      if (this.joinedPlayer.length + 1 > 2) {
        return false;
      }
      newJoinedPlayer = newJoinedPlayer.concat({
        user: newUser,
        side: gameSide,
        online: true,
      });
    }
    this.joinedPlayer = newJoinedPlayer;
    this.resetPlayer();
    return true;
  }

  kickPlayer(playerId: string): boolean {
    if (this.joinedPlayer.length === 0) {
      return false;
    }
    this.joinedPlayer = this.joinedPlayer.filter(
      ({ user }) => user.id !== playerId,
    );
    this.resetPlayer();
    return true;
  }

  async startGame(gameService: GameService) {
    const gameEntity = await gameService.createGameEntity(this);
    this.gameModel = new GameModel(this.roomOption, gameEntity, () =>
      gameService.handleEndGame(this),
    );
    this.gameModel.startGame();
    this.gameID = this.gameModel.getGameID();
    return this.gameID;
  }

  resetGameState() {
    this.gameModel = null;
    this.gameID = null;
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
    return this.players[turnSide].id;
  }

  isHost(userDTO: UserDTO) {
    return userDTO.id === this.host.id;
  }

  isPlayer(userInfo: UserDTO) {
    return this.joinedPlayer.some(({ user }) => user.id === userInfo.id);
  }

  getChatChannelEntity(): ChatChannelEntity {
    return this.chatChannelEntity;
  }
}
