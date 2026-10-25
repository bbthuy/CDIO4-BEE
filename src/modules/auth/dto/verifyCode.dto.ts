import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({ description: 'Token returned by the request that sent the code' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: '6-digit code received by email', example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits' })
  code: string;
}
