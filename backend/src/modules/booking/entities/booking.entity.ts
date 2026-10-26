import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AppointmentSchedule } from '../../schedule/entities/schedule.entity';
import { User } from '../../users/entities/user.entity';
import { BookingStatus } from '../enums/bookingStatus.enum';
import { template } from 'handlebars';
import { IBooking } from '../interfaces/booking.interface';

@Entity('bookings')
export class Booking implements IBooking {
  @PrimaryGeneratedColumn()
  id: number;

  // --- QUAN HỆ VỚI SCHEDULE (LỊCH BÁC SĨ) ---
  @Column({ name: 'schedule_id' })
  scheduleId: number;

  @ManyToOne(() => AppointmentSchedule)
  @JoinColumn({ name: 'schedule_id' })
  schedule: AppointmentSchedule;

  // --- QUAN HỆ VỚI USER (BỆNH NHÂN) ---
  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // --- TRẠNG THÁI ---
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING
  })
  status: BookingStatus;

  // Ghi chú của user khi đặt
  @Column({ type: 'text', nullable: true })
  note: string;

  // Lý do hủy
  @Column({ name: 'cancel_reason', type: 'text', nullable: true })
  cancelReason: string;

  // Cờ gửi mail nhắc nhở
  @Column({ name: 'is_reminder_sent', default: false })
  isReminderSent: boolean;

  // --- TIMESTAMPS ---
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  price: number;
}
