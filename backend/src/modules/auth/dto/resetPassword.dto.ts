// dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches, MaxLength } from 'class-validator';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token for verification' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: ERROR_MESSAGES.auth.PASSWORD_MISSING_REQUIREMENTS.message
  })
  @IsNotEmpty()
  newPassword: string;
}
