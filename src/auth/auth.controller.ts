import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { UserDTO } from 'src/users/users.dto';
import { UserService } from './../users/users.service';
import {
  ActivateUserDTO,
  CreateUserDTO,
  ResetPasswordDTO,
  UserLoginDTO,
  UserLoginGoogleOAuthDTO,
} from './auth.dto';
import {
  LoginResponse,
  RequestWithUser,
  VerifyResponse,
} from './auth.interface';
import { AuthService } from './auth.service';
import { JWTAuthenticationGuard } from './guards/jwt.guard';
import { LocalAuthenticationGuard } from './guards/local.guard';
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @HttpCode(200)
  @Get('verify')
  @UseGuards(JWTAuthenticationGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    type: VerifyResponse,
  })
  async verify(
    @Req() requestWithUser: RequestWithUser,
  ): Promise<VerifyResponse> {
    const { user } = requestWithUser;
    const userInfo = await this.userService.findUser({
      username: user.username,
    });
    return { user: userInfo };
  }

  @Post('register')
  @ApiResponse({
    status: 200,
    type: UserDTO,
  })
  async registerUser(@Body() userData: CreateUserDTO) {
    return await this.userService.createUser(userData);
  }

  @HttpCode(200)
  @Post('login')
  @UseGuards(LocalAuthenticationGuard)
  @ApiBody({ type: UserLoginDTO })
  @ApiResponse({
    status: 200,
    type: LoginResponse,
  })
  async login(@Req() requestWithUser: RequestWithUser) {
    const { user } = requestWithUser;
    if (user) {
      return this.authService.getToken(user as UserDTO);
    }
  }

  @Post('oauth/google')
  @ApiResponse({
    status: 200,
    type: LoginResponse,
  })
  async loginByOAuth(@Body() googleOAuthToken: UserLoginGoogleOAuthDTO) {
    const { idToken } = googleOAuthToken;
    return await this.authService.loginWithGoogleOAuthToken(idToken);
  }

  @Post('activate')
  async activateUser(@Body() activateUserData: ActivateUserDTO) {
    const result = await this.authService.activateUser(activateUserData);
    if (result) {
      return {
        message: 'User has been activated',
      };
    }
  }

  @Post('forgotPassword')
  async resetPassword(@Body() resetPasswordData: ResetPasswordDTO) {
    const { email } = resetPasswordData;
    const result = await this.authService.resetPassword(email);
    if (result) {
      return {
        message: `An e-mail has been sent to ${email} with further instructions.`,
      };
    }
  }
}
