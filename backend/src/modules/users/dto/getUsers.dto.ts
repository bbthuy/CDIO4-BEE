import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '../interfaces/user.interface';

export class GetUsersDto {
  @ApiProperty({ description: 'Page number', required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Number of items per page', required: false })
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: 'Search by first name or last name', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Filter by status', enum: UserStatus, required: false })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiProperty({ description: 'Sort by field', required: false })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ description: 'Sort order (ASC/DESC)', required: false })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
