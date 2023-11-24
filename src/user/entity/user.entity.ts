import { IsEmail, IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  declare name: string;

  @Unique(['email'])
  @Column()
  @IsEmail({}, { message: 'Invalid email format' })
  declare email: string;

  @Column()
  @IsNotEmpty({ message: 'Password cannot be empty' })
  declare password: string;

  @Column({ default: false })
  declare status: boolean;
}
