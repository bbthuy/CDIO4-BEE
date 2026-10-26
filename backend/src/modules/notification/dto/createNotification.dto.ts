import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MinLength } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty()
  @IsInt()
  receiverId: number;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  message: string;
}
