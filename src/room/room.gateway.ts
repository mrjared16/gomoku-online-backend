import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { Config } from 'src/shared/config';

// @WebSocketGateway(Number(Config.getCurrentHost().socketPort), {
//   namespace: 'room'
// })
// @WebSocketGateway(3002)
export class RoomGateWay implements OnGatewayConnection {
  handleConnection(client: any, ...args: any[]) {
    console.log('listen!');
  }

}