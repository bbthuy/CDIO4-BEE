// dto/cancel-booking.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelBookingDto {
  @IsString()
  @IsNotEmpty()
  reason: string; // Lý do hủy (VD: Bác sĩ bận đột xuất)
}
