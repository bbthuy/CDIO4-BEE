import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpecialtyDto {
  @ApiProperty({ example: 'Tim mạch', description: 'Tên chuyên khoa' })
  @IsNotEmpty({ message: 'Tên chuyên khoa không được để trống' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Chuyên khoa về tim và mạch máu' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/icon.png' })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({ example: 200000, description: 'Giá dịch vụ (VNĐ)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
