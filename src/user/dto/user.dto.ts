import { IsString, IsEmail, MinLength, Matches } from 'class-validator';

export class UserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  email: string;

  @IsString()
  @MinLength(5, { message: 'Password must be at least 5 characters' })
  password: string;
}
