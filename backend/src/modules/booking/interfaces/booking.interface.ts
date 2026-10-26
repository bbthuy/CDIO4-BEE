import { BookingStatus } from '../enums/bookingStatus.enum';

export interface IBooking {
  id: number;
  scheduleId: number;
  userId: number;
  status: BookingStatus;
  note?: string;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;

  userEmail?: string;
  doctorEmail?: string;
}
