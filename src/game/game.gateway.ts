import { Config } from 'src/shared/config';
import { Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthService } from 'src/auth/auth.service';
import { GameService } from './game.service';



@WebSocketGateway(3002, { namespace: 'game' })
export class GameGateWay implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(
    private authService: AuthService,
    private gameService: GameService
  ) {

  }

  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('GameGateway');


  afterInit(server: Server) {
    this.logger.log(`Game Socket is running on port ${Config.getCurrentHost().socketPort}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const { query } = client.handshake;
    const { token } = query as { token: string };

    const userConnected = await this.authService.getUser(token);
    if (!userConnected) {
      return;
    }

    this.logger.log(`An user connected: ${userConnected.username} - ${client.id}`);

    this.gameService.addUser(userConnected, client.id);
    if (this.gameService.hasUserOnlineAlready(userConnected)) {
      return;
    }
    this.server.emit('new user connected', userConnected);
  }

  @SubscribeMessage('initial-client')
  async identity() {
    this.server.emit('initial-server', 'hello');
    return 'first response';
  }

  async handleDisconnect(client: Socket) {
    const { query } = client.handshake;
    const { token } = query as { token: string };

    const userConnected = await this.authService.getUser(token);
    if (!userConnected) {
      return;
    }
    const { username, id } = userConnected;

    this.gameService.removeUser(userConnected, client.id);

    this.logger.log(`An user disconnected: ${username}`);
    this.server.emit('new user disconnected', id);
  }


}
