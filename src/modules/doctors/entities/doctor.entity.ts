import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Specialty } from '../../specialties/entities/specialty.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Specialty, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'specialty_id' })
  specialty: Specialty;

  @Column({ name: 'specialty_id', nullable: true })
  specialtyId: number;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'experience_years', default: 0 })
  experienceYears: number;

  @Column({ name: 'consultation_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  consultationFee: number;

  @Column({ type: 'simple-array', nullable: true })
  education: string[];

  @Column({ name: 'certificate_url', nullable: true })
  certificateUrl: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  rating: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
