import { UserService } from './../../users/users.service';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Config } from 'src/shared/config';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private userService: UserService) {
    super(Config.getPassportLocalStrategyConfig());
  }

  async validate(username: string, password: string) {
    return this.userService.validateUser(username, password);
  }
}
