import { AuthController } from './auth.controller';
import { UserModule } from './../users/users.module';
import { forwardRef, Module } from "@nestjs/common";

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [AuthController],
  providers: []
})
export class AuthModule{}