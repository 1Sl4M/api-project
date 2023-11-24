import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { CustomHttpException } from './exceptions/http-exception.class';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

jest.mock('bcrypt');

describe('UserService', () => {
  let userService: UserService;
  let cacheManager: any;

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        User,
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should create user successfully', async () => {
    const userDto = {
      name: 'Konstantin',
      email: 'kostya78@example.com',
      password: 'password123',
    };

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

    jest.spyOn(userService, 'checkEmailExists').mockResolvedValue(false);

    jest.spyOn(userService.users, 'create').mockReturnValue({} as User);
    jest.spyOn(userService.users, 'save').mockResolvedValue({} as User);
    jest
      .spyOn(userService, 'updateUserById')
      .mockResolvedValue(userDto as User);

    await expect(userService.createUser(userDto)).resolves.toEqual(userDto);

    expect(userService.users.create).toHaveBeenCalledWith({
      name: userDto.name,
      email: userDto.email,
      password: 'hashedPassword',
    });
    expect(userService.users.save).toHaveBeenCalledWith({} as User);
    expect(userService.updateUserById).toHaveBeenCalledWith(expect.any(Number));
  });

  it('should use cache manager', async () => {
    cacheManager.get.mockResolvedValueOnce({
      id: 7,
      name: 'Tamerlan',
      email: 'tamer@gmail.com',
      password: 562322,
      status: true,
    });

    await expect(cacheManager.get('7')).resolves.toEqual({
      id: 7,
      name: 'Tamerlan',
      email: 'tamer@gmail.com',
      password: 562322,
      status: true,
    });
  });

  it('should throw exception if email already exists', async () => {
    const userDto = {
      name: 'Tamerlan',
      email: 'tamer123654@gmail.com',
      password: '562322',
    };

    jest.spyOn(userService, 'checkEmailExists').mockResolvedValue(true);

    await expect(userService.createUser(userDto)).rejects.toThrowError(
      new CustomHttpException(400, 'ERR_USER_EMAIL_EXISTS'),
    );

    expect(userService.checkEmailExists).toHaveBeenCalledWith(userDto.email);
  });
});
