import { LocalAuthenticationGuard } from './guards/local.guard';
import { UserService } from './../users/users.service';
import { CreateUserDTO } from './../users/users.dto';
import { Body, Controller, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import { RequestWithUser } from './auth.interface';
import { AuthService } from './auth.service';
import { GoogleOAuthToken } from './auth.dto';
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService) {

  }

  @Post('register')
  async registerUser(@Body() userData: CreateUserDTO) {
    return await this.userService.createUser(userData);
  }

  @HttpCode(200)
  @Post('login')
  @UseGuards(LocalAuthenticationGuard)
  async login(@Req() requestWithUser: RequestWithUser) {
    const { user } = requestWithUser;
    if (user) {
      return this.authService.getToken(user);
    }
  }

  @Post('oauth/google')
  async loginByOAuth(@Body() googleOAuthToken: GoogleOAuthToken) {
    const { idToken } = googleOAuthToken;
    return await this.authService.loginWithGoogleOAuthToken(idToken);
  }

}