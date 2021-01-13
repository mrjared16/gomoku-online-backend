import { MailerService } from '@nestjs-modules/mailer';
import {
  forwardRef,
  HttpException,
  HttpService,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { Config } from 'src/shared/config';
import { UserEntity } from 'src/users/users.entity';
import { UserDTO } from './../users/users.dto';
import { UserService } from './../users/users.service';
import {
  ActivateUserDTO,
  ChangePasswordDTO,
  GoogleOAuthResponse,
} from './auth.dto';
import { JWTPayload, LoginResponse } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private httpService: HttpService,
    @Inject(forwardRef(() => UserService))
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

  decodeToken(token: string): JWTPayload {
    const userData: JWTPayload = this.jwtService.decode(token) as JWTPayload;
    if (!userData) return null;
    return userData;
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

  createRandomCode(): string {
    return randomBytes(20).toString('hex');
  }

  async sendUserVerificationEmail(email: string, userCreated: UserEntity) {
    if (!userCreated) {
      userCreated = await this.userService.getUserEntity({ email });
    }
    const { activateCode, firstName } = userCreated;
    const activateLink = `${Config.getClientHost()}/activate/${activateCode}`;
    const emailContent = `<div>Hello ${firstName}, <br/>
      Please verify your account by clicking the link: <a href=${activateLink}>${activateLink}</a>
      <br/>
      <br/>
      Thank You!</div>`;
    this.mailService
      .sendMail({
        to: email,
        subject: 'Gomoku online verify account',
        html: emailContent,
      })
      // .then((response) => console.log({ response }))
      .catch((error) => console.log({ error }));
  }

  async activateUser(activateUserData: ActivateUserDTO) {
    const { token } = activateUserData;
    return await this.userService.activateUser(token);
  }

  async sendResetPasswordEmail(email: string, user: UserEntity) {
    if (!user) {
      user = await this.userService.getUserEntity({ email });
    }
    const { resetPasswordToken, firstName } = user;
    const resetLink = `${Config.getClientHost()}/resetPassword/${resetPasswordToken}`;
    const emailContent = `<div>Hi ${firstName}, <br/> <br/>
      You are receiving this because you (or someone else) have requested the reset of the password for your account. <br/> <br/>
      Please click on the following link, or paste this into your browser to complete the process: <br/> <br/>
      ${resetLink}
      If you did not request this, please ignore this email and your password will remain unchanged.<br/>
      </div>`;
    this.mailService
      .sendMail({
        to: email,
        subject: `Gomoku online reset account password`,
        html: emailContent,
      })
      // .then((response) => console.log({ response }))
      .catch((error) => console.log({ error }));
  }

  async forgetPassword(email: string) {
    const user = await this.userService.createResetPasswordToken(email);
    const result = await this.sendResetPasswordEmail(email, user);
    return true;
  }

  async resetPassword(token: string) {
    const user = await this.userService.getResetPasswordUser(token);
    if (!user) {
      throw new HttpException(
        'Password reset token is invalid or has expired.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }

  async changePassword(changePasswordData: ChangePasswordDTO) {
    const { token, newPassword, confirmNewPassword } = changePasswordData;
    const user = await this.userService.getResetPasswordUser(token);
    if (!user) {
      throw new HttpException(
        'Password reset token is invalid or has expired.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (newPassword != confirmNewPassword) {
      throw new HttpException(
        'Confirm password does not match.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.userService.changePassword(user, newPassword);
    return true;
  }
}
