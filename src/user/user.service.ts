import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CustomHttpException } from './exceptions/http-exception.class';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  CACHE_TTL,
  ERR_USER_EMAIL_EXISTS,
  ERR_USER_NOT_FOUND,
} from '../constants/user.constants';
import { UserSuccessOut } from './dto/user-success.out';
import axios from 'axios';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    public readonly users: Repository<User>,
    @Inject(CACHE_MANAGER) private cache: Cache,
    @InjectQueue('statusUpdateQueue')
    private readonly statusUpdateQueue: Queue,
  ) {}

  async createUser(userDto: UserDto): Promise<User> {
    const { name, email, password } = userDto;

    const salt = 10;

    const hashedPassword = await bcrypt.hash(password, salt);

    if (await this.checkEmailExists(email)) {
      throw new CustomHttpException(400, ERR_USER_EMAIL_EXISTS);
    } else {
      const newUser = this.users.create({
        name,
        email,
        password: hashedPassword,
      });
      await this.statusUpdateQueue.add(
        'updateStatus',
        { id: newUser.id },
        { delay: 10000 },
      );

      await this.users.save(newUser);

      const updatedUser = await this.updateUserById(newUser.id);

      return updatedUser;
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const emailExists = await this.users.findOneBy({ email });
    return emailExists ? true : false;
  }

  async updateUserById(userId: number) {
    const user = await this.users.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new CustomHttpException(404, 'User not found');
    }

    user.status = true;

    await this.users.save(user);

    return user;
  }

  async getUserById(userId: number): Promise<UserSuccessOut> {
    const existingUser = await this.users.findOneBy({ id: userId });

    if (!existingUser) {
      throw new CustomHttpException(404, ERR_USER_NOT_FOUND);
    }

    const cachedUser = await this.cache.get<User>(userId.toString());

    if (!cachedUser) {
      await this.cache.set(existingUser.id.toString(), existingUser, {
        ttl: CACHE_TTL,
      });

      return {
        statusCode: 200,
        message: 'SUCCESS REDIS',
        user: existingUser,
      };
    }

    return { statusCode: 200, message: 'SUCCESS', user: cachedUser };
  }

  async makeRequestWithProxy(): Promise<any> {
    const proxyConfig = {
      protocol: 'http',
      host: '45.196.48.9',
      port: 5435,
      auth: {
        username: 'jtzhwqur',
        password: 'jnf0t0n2tecg',
      },
    };
    axios
      .get('http://localhost:3000/user/get-user-by-id?userId=5', {
        proxy: proxyConfig,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => console.error(err));
  }
}
