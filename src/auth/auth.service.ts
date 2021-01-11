import { UserService } from './../users/users.service';
import { ActivateUserDTO, GoogleOAuthResponse } from './auth.dto';
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
import { UserEntity } from 'src/users/users.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { Config } from 'src/shared/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private httpService: HttpService,
    private userService: UserService,
    private mailService: MailerService,
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

  async sendUserVerificationEmail(email: string, userCreated: UserEntity) {
    if (!userCreated) {
      userCreated = await this.userService.getUserEntity({ email });
    }
    const { activateCode, firstName } = userCreated;
    const activateLink = `${Config.getClientHost()}/activate/${activateCode}`;
    const emailContent = `Hello ${firstName},
      Please verify your account by clicking the link: <a>${activateLink}</a>
      Thank You!`;
    this.mailService.sendMail({
      to: email,
      // from: 'noreply@nestjs.com', // sender address
      subject: 'Gomoku online user activate',
      html: emailContent,
    });
  }

  async activateUser(activateUserData: ActivateUserDTO) {
    const { token } = activateUserData;
    return await this.userService.activateUser(token);
  }
}
