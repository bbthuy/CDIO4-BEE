import { IsString, IsNumber, IsOptional, IsArray, IsEmail } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsNumber()
  specialtyId: number;

  @IsNumber()
  experienceYears: number;

  @IsNumber()
  consultationFee: number;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  education?: string[];

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  certificateUrls?: string[];
}
