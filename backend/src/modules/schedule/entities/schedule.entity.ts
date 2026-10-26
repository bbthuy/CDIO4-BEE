import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Doctor } from 'src/modules/doctors/entities/doctor.entity';

@Entity('appointment_schedules')
export class AppointmentSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'doctor_id', type: 'int' })
  doctorId: number;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'start_time', type: 'varchar', length: 10 })
  startTime: string;

  @Column({ name: 'end_time', type: 'varchar', length: 10 })
  endTime: string;

  @Column({
    name: 'appointment_type',
    type: 'enum',
    enum: ['offline', 'online'],
    default: 'offline'
  })
  appointmentType: 'offline' | 'online';

  @Column({ name: 'max_patients', type: 'int', default: 1 })
  maxPatients: number;

  @Column({ name: 'booked_patients', type: 'int', default: 0 })
  bookedPatients: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
