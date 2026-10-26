import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SendToAllDoctorsDto {
  @ApiProperty({
    description: 'Nội dung thông báo gửi cho tất cả bác sĩ',
    example: 'Thông báo bảo trì hệ thống vào 20h tối nay'
  })
  @IsString()
  @MinLength(1, { message: 'Nội dung thông báo không được để trống' })
  message: string;
}
