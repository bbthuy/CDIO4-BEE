import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, Matches, IsBoolean } from 'class-validator';
import { UserRole, UserStatus } from '../interfaces/user.interface';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';

export class BaseUserDto {
  @ApiProperty({ description: 'First name of the user', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Last name of the user', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description:
      'Password for the user account (minimum 8 characters, must contain at least one uppercase letter, one lowercase letter, one number, and one special character)',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: ERROR_MESSAGES.user.PASSWORD_MISSING_REQUIREMENTS.message
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Status of the user', enum: UserStatus, default: UserStatus.INACTIVE, required: false })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiProperty({ description: 'Role of the user', enum: UserRole, default: UserRole.USER, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ description: 'Indicates if the user is active', default: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Indicates if the user is a project owner', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  isProjectOwner?: boolean;
}
