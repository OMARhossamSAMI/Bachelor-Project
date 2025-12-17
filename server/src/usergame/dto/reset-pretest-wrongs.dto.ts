import { IsEmail } from 'class-validator';

export class ResetPretestWrongsDto {
  @IsEmail()
  email: string;
}
