import { forwardRef, Inject } from '@nestjs/common';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io/dist/socket';
import { Config } from 'src/shared/config';
import { GAME_MESSAGE } from './game.constants';
import {
  HitDTO,
  JoinGameDTO,
  RequestGameDTO as RequestGameResultDTO,
} from './game.dto';
import { BroadcastGameEventToCurrentRoomResponse } from './game.interface';
import { GameService } from './game.service';

// @WebSocketGateway(Number(Config.getCurrentHost().socketPort), {
//   namespace: 'game',
// })
@WebSocketGateway({
  namespace: 'game',
})
export class GameGateway implements OnGatewayConnection {
  constructor(
    @Inject(forwardRef(() => GameService))
    private gameService: GameService,
  ) {}

  @WebSocketServer() server: Socket;

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Game Gateway listen!');
  }

  @SubscribeMessage(GAME_MESSAGE.ON_HIT)
  async hit(socket: Socket, data: HitDTO) {
    await this.gameService.handleHit(socket, data);
  }

  @SubscribeMessage(GAME_MESSAGE.ON_JOIN)
  async join(socket: Socket, data: JoinGameDTO) {
    console.log({ data });
    const { roomID } = data;
    await socket.join(roomID);
    // await this.gameService.handleJoin(this, socket, data);
  }

  @SubscribeMessage(GAME_MESSAGE.ON_REQUEST)
  async handleRequestGameResult(socket: Socket, data: RequestGameResultDTO) {
    await this.gameService.handleRequestGameResult(socket, data);
  }

  broadcastGameEventToMember(
    room: Socket,
    roomID: string,
    broadcastGameEventToCurrentRoomDTO: BroadcastGameEventToCurrentRoomResponse,
    isBroadcast = false,
  ) {
    console.log({
      broadcastGameEventToCurrentRoomDTO,
    });
    const socket = isBroadcast ? this.server.in(roomID) : room.to(roomID);
    socket.emit(
      GAME_MESSAGE.BROADCAST_GAME,
      broadcastGameEventToCurrentRoomDTO,
    );
  }
}
