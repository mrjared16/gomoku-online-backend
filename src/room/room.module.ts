import { RoomService } from './room.service';
import { forwardRef, Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { RoomController } from './room.controller';
import { RoomManager } from './room.model';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [RoomController],
  providers: [RoomGateway, RoomService, RoomManager],
})
export class RoomModule {}
