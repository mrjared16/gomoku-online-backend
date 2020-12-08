import { UserDTO } from './../users/users.dto';
import { Injectable } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {

  }
  getToken(userData: UserDTO) {
    const { id, username } = userData;
    const jwtPayload: JWTPayload = { userId: id, username };
    return {
      accessToken: this.jwtService.sign(jwtPayload)
    }
  }
}