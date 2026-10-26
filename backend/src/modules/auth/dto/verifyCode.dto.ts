import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';

export class VerifyCodeDto {
  @ApiProperty({ description: 'Token for verification' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'One-time password (OTP) for verification' })
  @IsNotEmpty()
  @MaxLength(6, { message: ERROR_MESSAGES.auth.CODE_INVALID_LENGTH.message })
  code: string;
}
