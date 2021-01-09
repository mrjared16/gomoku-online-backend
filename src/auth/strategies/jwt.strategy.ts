import { JWTPayload } from './../auth.interface';
import { Config } from './../../shared/config';
import { AuthService } from './../auth.service';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super(Config.getPassportJWTStrategyConfig());
  }

  async validate(jwtPayload: JWTPayload): Promise<JWTPayload> {
    // console.log({ jwtPayload });
    const { id, username } = jwtPayload;
    return { id, username };
  }
}
