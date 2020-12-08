import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { UserModule } from './../users/users.module';
import { forwardRef, Module } from "@nestjs/common";
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { Config } from 'src/shared/config';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(Config.getJWTConfig()),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy]
})
export class AuthModule { }