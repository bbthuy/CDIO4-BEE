import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @IsNotEmpty()
  scheduleId: number;

  @IsInt()
  @IsOptional()
  userId: number;

  @IsString()
  @IsOptional()
  note?: string;
}
