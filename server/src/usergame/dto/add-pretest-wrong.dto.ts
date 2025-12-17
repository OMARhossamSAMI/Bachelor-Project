import { IsEmail, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AddPretestWrongDto {
  @IsEmail()
  email: string;

  @Type(() => Number)
  @IsInt()
  questionId: number;
}
