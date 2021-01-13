import { Config } from 'src/shared/config';

import { AuthController } from './auth.controller';
import { UserModule } from './../users/users.module';
import { forwardRef, HttpModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport/dist/passport.module';

import { AuthService } from './auth.service';
import { JWTStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(Config.getJWTConfig()),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JWTStrategy],
  exports: [AuthService],
})
export class AuthModule {}
