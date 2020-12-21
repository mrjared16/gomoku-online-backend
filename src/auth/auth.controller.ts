import { JWTAuthenticationGuard } from './guards/jwt.guard';
import { LocalAuthenticationGuard } from './guards/local.guard';
import { UserService } from './../users/users.service';
import { CreateUserDTO, UserDTO, UserLoginDTO } from './../users/users.dto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  RequestWithUser,
  LoginResponse,
  VerifyResponse,
} from './auth.interface';
import { AuthService } from './auth.service';
import { UserLoginGoogleOAuthDTO } from './auth.dto';
import { ApiBody, ApiResponse, ApiResponseProperty } from '@nestjs/swagger';
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @HttpCode(200)
  @Get('verify')
  @UseGuards(JWTAuthenticationGuard)
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
      return this.authService.getToken(user);
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
}
