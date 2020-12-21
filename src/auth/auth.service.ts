import { UserService } from './../users/users.service';
import { GoogleOAuthResponse } from './auth.dto';
import { UserDTO } from './../users/users.dto';
import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload, LoginResponse } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private httpService: HttpService,
    private userService: UserService,
  ) {}
  getToken(userData: UserDTO): LoginResponse {
    const { id, username } = userData;
    const jwtPayload: JWTPayload = { userId: id, username };

    return {
      accessToken: this.jwtService.sign(jwtPayload),
    };
  }

  async getUser(token: string) {
    const userData: JWTPayload | any = this.jwtService.decode(token);
    if (!userData) return null;
    const { userId } = userData as JWTPayload;
    return await this.userService.findUser({ id: userId });
  }

  private async getGoogleUserData(googleOAuthToken: string) {
    try {
      const response = await this.httpService
        .get(
          `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${googleOAuthToken}`,
        )
        .toPromise();
      const { data } = response as { data: GoogleOAuthResponse };
      const { email, name } = data;
      return { email, name };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async loginWithGoogleOAuthToken(googleOAuthToken: string) {
    const googleUserData = await this.getGoogleUserData(googleOAuthToken);
    if (googleUserData == null) {
      throw new HttpException(
        'Error when verify Google OAuth',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    const { email, name } = googleUserData;
    const userWithThisUsername = await this.userService.findUser({
      username: email,
    });
    if (userWithThisUsername) {
      return this.getToken(userWithThisUsername);
    }

    const newUser = await this.userService.createUser({
      name,
      username: email,
      password: null,
    });
    return this.getToken(newUser);
  }
}
