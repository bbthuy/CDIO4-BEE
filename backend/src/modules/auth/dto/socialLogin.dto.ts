import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LoginMethod } from '../interfaces/loginHistory.interface';

export class SocialLoginDto {
  @ApiProperty({ description: 'Authorization code from social login provider' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Social login method' })
  @IsEnum(LoginMethod)
  @IsNotEmpty()
  method: LoginMethod;
}
