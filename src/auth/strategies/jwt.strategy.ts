import { JWTPayload } from './../auth.interface';
import { Config } from './../../shared/config';
import { AuthService } from './../auth.service';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';


export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super(Config.getPassportJWTStrategyConfig());
  }

  async validate(jwtPayload: JWTPayload) {
    // console.log({ jwtPayload });
    const { userId, username } = jwtPayload;
    return { userId, username };
  }
}