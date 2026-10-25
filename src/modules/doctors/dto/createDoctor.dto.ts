import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty({ example: 'BS. Nguyễn Văn A' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'nguyenvana@clinic.com' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: 1, description: 'ID chuyên khoa' })
  @IsNotEmpty({ message: 'Chuyên khoa không được để trống' })
  @IsNumber()
  specialtyId: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  consultationFee?: number;

  @ApiPropertyOptional({ example: 'Bác sĩ chuyên khoa tim mạch với hơn 10 năm kinh nghiệm' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: ['Đại học Y Hà Nội', 'Thạc sĩ Y khoa'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  education?: string[];

  @ApiPropertyOptional({ example: 'https://example.com/uploads/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/uploads/cert.pdf' })
  @IsOptional()
  @IsString()
  certificateUrl?: string;
}
