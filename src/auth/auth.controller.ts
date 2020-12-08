import { UserService } from './../users/users.service';
import { CreateUserDTO } from './../users/users.dto';
import { Body, Controller, Post } from "@nestjs/common";

@Controller('auth')
export class AuthController {
  constructor(private userService: UserService) {

  }

  @Post('register')
  async registerUser(@Body() userData: CreateUserDTO) {
    return await this.userService.createUser(userData);
  }
}