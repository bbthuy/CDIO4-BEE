import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Booking } from '../../booking/entities/booking.entity';
import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { IMedicalRecord, IPrescriptionItem } from '../interfaces/medical-record.interface';

@Entity('medical_records')
export class MedicalRecord implements IMedicalRecord {
  @PrimaryGeneratedColumn()
  id: number;

  // Liên kết với Booking (1 Lịch hẹn = 1 Hồ sơ)
  @OneToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'booking_id' })
  bookingId: number;

  // Bệnh nhân
  @ManyToOne(() => User)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'patient_id' })
  patientId: number;

  // Bác sĩ
  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  // === CẤU TRÚC SOAP ===

  @Column({ type: 'text', nullable: true })
  subjective: string; // S: Triệu chứng chủ quan (Bệnh nhân kể)

  @Column({ type: 'text', nullable: true })
  objective: string; // O: Khám khách quan (Đo đạc, xét nghiệm)

  @Column({ type: 'text', nullable: true })
  assessment: string; // A: Chẩn đoán, đánh giá

  @Column({ type: 'text', nullable: true })
  plan: string; // P: Kế hoạch điều trị, lời dặn

  @Column({ type: 'text', nullable: true })
  diagnosis: string; // Chẩn đoán tóm tắt (VD: Viêm họng cấp)

  @Column({ type: 'json', nullable: true })
  prescription: IPrescriptionItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
