import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { UserStatus } from '../interfaces/user.interface';

export class UpdateUserDto {
  @ApiProperty({ description: 'First name of the user' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description:
      'Password for the user account (minimum 8 characters, must contain at least one uppercase letter, one lowercase letter, one number, and one special character)',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })
  @IsOptional()
  password?: string;

  @ApiProperty({ description: 'Status of the user', enum: UserStatus })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
