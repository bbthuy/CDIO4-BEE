import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDate } from 'class-validator';
import { BaseUserDto } from './baseUser.dto';

export class UpdateUserDto extends PartialType(BaseUserDto) {
  @IsNumber()
  @IsOptional()
  failedLoginAttempt?: number;

  @IsDate()
  @IsOptional()
  failedLoginTime?: Date;

  @IsString()
  @IsOptional()
  refreshToken?: string;
}
