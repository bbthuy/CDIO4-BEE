import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScheduleDto {
  @IsInt()
  @IsOptional()
  doctorId: number;

  @IsString()
  @IsNotEmpty()
  date: string; // yyyy-mm-dd

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsEnum(['offline', 'online'])
  appointmentType: 'offline' | 'online';

  @IsInt()
  maxPatients: number;
}
