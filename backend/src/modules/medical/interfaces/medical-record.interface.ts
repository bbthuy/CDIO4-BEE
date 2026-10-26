import { Booking } from '../../booking/entities/booking.entity';
import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

export interface IPrescriptionItem {
  name: string;
  quantity: number;
  unit: string;
  dosage: string;
}

export interface IMedicalRecord {
  id: number;

  // Khóa ngoại
  bookingId: number;
  patientId: number;
  doctorId: number;

  // Thông tin SOAP
  subjective?: string; // S
  objective?: string; // O
  assessment?: string; // A
  plan?: string; // P
  diagnosis?: string; // Chẩn đoán

  // Danh sách thuốc (Mảng các đơn thuốc)
  prescription?: IPrescriptionItem[];

  // Thời gian
  createdAt: Date;
  updatedAt: Date;

  // Relations (Optional - dùng khi query có join bảng)
  booking?: Booking;
  patient?: User;
  doctor?: Doctor;
}
