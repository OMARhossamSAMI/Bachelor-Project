import { IsEmail } from 'class-validator';

export class CreateUserGameDto {
  @IsEmail()
  email: string; // link to user
}
