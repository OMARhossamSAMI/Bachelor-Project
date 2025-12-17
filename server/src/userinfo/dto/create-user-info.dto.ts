import {
  IsEmail,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
} from 'class-validator';

export class CreateUserInfoDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  germanLevel?: string;

  // ✅ NEW field
  @IsOptional()
  @IsString()
  previousExperience?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsString()
  favoriteCuisine?: string;

  @IsOptional()
  @IsString()
  regionPreference?: string;
}
