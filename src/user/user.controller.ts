import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { User } from './entity/user.entity';
import { UserSuccessOut } from './dto/user-success.out';
import { CustomHttpException } from './exceptions/http-exception.class';
import { ERR_PROXY } from '../constants/user.constants';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() userDto: UserDto): Promise<User> {
    return this.userService.createUser(userDto);
  }

  @Get('get-user-by-id')
  async getUserById(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<UserSuccessOut> {
    return this.userService.getUserById(userId);
  }

  @Get('proxy')
  async makeRequestWithProxy(): Promise<any> {
    try {
      const result = await this.userService.makeRequestWithProxy();
      return { success: true, data: result };
    } catch (error) {
      throw new CustomHttpException(500, ERR_PROXY);
    }
  }
}
