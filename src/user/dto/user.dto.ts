import {
  IsString,
  IsEmail,
  MinLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(3)
  declare name: string;

  @IsEmail()
  //@Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  declare email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(5, { message: 'Password must be at least 5 characters' })
  declare password: string;
}
