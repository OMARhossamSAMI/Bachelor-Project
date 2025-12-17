// update-user-game.dto.ts
import {
  IsOptional,
  IsNumber,
  IsEmail,
  IsArray,
  IsInt,
  ArrayUnique,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserGameDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  pretestScore?: number;

  // ✅ NEW
  @IsOptional()
  @IsNumber()
  posttestScore?: number;

  @IsOptional()
  @IsNumber()
  level1Score?: number;

  @IsOptional()
  @IsNumber()
  level2Score?: number;

  @IsOptional()
  @IsNumber()
  level3Score?: number;

  @IsOptional()
  @IsNumber()
  level4Score?: number;

  @IsOptional()
  @IsNumber()
  level5Score?: number;

  @IsOptional()
  @IsNumber()
  totalPoints?: number;

  @IsOptional()
  @IsNumber()
  badges?: number;

  @IsOptional()
  @IsNumber()
  userLevel?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  pretestWrongQuestionIds?: number[];
}
