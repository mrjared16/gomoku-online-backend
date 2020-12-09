import { Config } from 'src/shared/config';
import { Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";



@WebSocketGateway(Config.getCurrentHost().socketPort)
export class GameGateWay implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  logger: Logger = new Logger('GameGateWay');
  map: Map<string, { id: string, username: string }> = new Map();
  counter = 0;
  afterInit(server: Server) {
    this.logger.log(`Game Socket is running on port ${Config.getCurrentHost().socketPort}`);
  }
  handleConnection(client: Socket, ...args: any[]): WsResponse<{ id: string, username: string }> {
    if (!this.map.has(client.id)) {
      this.logger.log(`An user connected: ${client.id}`);
      this.map.set(client.id, {
        id: `${++this.counter}`,
        username: 'new user'
      })
      return {
        event: 'new user connected',
        data: this.map.get(client.id)
      }
    }
  }

  @SubscribeMessage('first')
  async identity(): Promise<string> {
    this.logger.log('Test entry point');
    return 'test';
  }

  handleDisconnect(client: Socket): WsResponse<{ id: string, username: string }> {
    this.logger.log(`An user disconnected: ${client.id}`);
    return {
      event: 'new user disconnected',
      data: {
        id: `${this.counter--}`,
        username: 'new user'
      }
    }
  }

}