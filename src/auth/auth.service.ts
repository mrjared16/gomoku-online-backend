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
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private httpService: HttpService,
    private userService: UserService,
  ) {}
  getToken(userData: UserDTO): LoginResponse {
    const { id, username } = userData;
    const jwtPayload: JWTPayload = { id, username };

    return {
      accessToken: this.jwtService.sign(jwtPayload),
    };
  }

  async getUser(token: string) {
    const userData: JWTPayload | any = this.jwtService.decode(token);
    if (!userData) return null;
    const { id } = userData as JWTPayload;
    return await this.userService.findUser({ id });
  }

  private async getGoogleUserData(googleOAuthToken: string) {
    try {
      const response = await this.httpService
        .get(
          `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${googleOAuthToken}`,
        )
        .toPromise();
      const { data } = response as { data: GoogleOAuthResponse };
      const { email, name, given_name, family_name, picture } = data;
      return { email, name, given_name, family_name, picture };
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
    const { email, name, given_name, family_name, picture } = googleUserData;
    const userWithThisUsername = await this.userService.findUser({
      email: email,
    });
    if (userWithThisUsername) {
      return this.getToken(userWithThisUsername);
    }

    const newUser = await this.userService.createUser(
      {
        username: email,
        password: null,
        email: email,
        firstName: given_name,
        lastName: family_name,
        photoURL: picture,
      },
      true,
    );
    return this.getToken(newUser);
  }

  createActivateCode(): string {
    return randomBytes(20).toString('hex');
  }
}
