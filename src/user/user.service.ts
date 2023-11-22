import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { CustomHttpException } from './exceptions/http-exception.class';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  ERR_USER_EMAIL_EXISTS,
  ERR_USER_NOT_FOUND,
} from '../constants/user.constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createUser(userDto: UserDto): Promise<User> {
    const { email } = userDto;

    if (this.checkEmailExists(email))
      throw new CustomHttpException(400, ERR_USER_EMAIL_EXISTS);
    else return this.usersRepository.save(userDto);
    // todo: bull and status: true
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const emailExists = await this.usersRepository.findOneBy({ email });
    return emailExists ? true : false;
  }

  async getUserById(userId: number): Promise<User> {
    const cachedUser = await this.cacheManager.get<User>(userId.toString());

    const userExists = await this.usersRepository.findOneBy({ id: userId });

    if (!userExists) {
      throw new CustomHttpException(404, ERR_USER_NOT_FOUND);
    }
    return userExists;
  }
}
