// ===== notification.entity.ts =====
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { Doctor } from 'src/modules/doctors/entities/doctor.entity';
import { INotification } from '../interfaces/notification.interface';

@Entity('notifications')
export class Notification implements INotification {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'receiver_id' })
  receiverId: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.notifications)
  @JoinColumn({ name: 'receiver_id' })
  receiver: Doctor;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
