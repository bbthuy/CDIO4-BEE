import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

import { IDoctor } from '../interfaces/dorter.interface';
import { Review } from 'src/modules/reviews/entities/reviews.entities';
import { Notification } from 'src/modules/notification/entities/notification.entity';
import { Specialty } from 'src/modules/specialty/entities/specialty.entity';

@Entity('doctors')
export class Doctor implements IDoctor {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // USER ACCOUNT of doctor
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  // SPECIALTY (reference to specialties table)
  @ManyToOne(() => Specialty, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'specialty_id' })
  specialty: Specialty;

  @Column({ name: 'specialty_id', nullable: true })
  specialtyId: number | null;

  // Avatar (URL)
  @Column({ name: 'avatar', type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  // Years of experience
  @Column({ name: 'experience_years', type: 'int', default: 0 })
  experienceYears: number;

  // Fee (VND)
  @Column({ name: 'consultation_fee', type: 'int', default: 0 })
  consultationFee: number;

  // Bio / Description
  @Column({ type: 'text', nullable: true })
  bio?: string;

  // Education
  @Column({ type: 'text', nullable: true })
  education?: string;

  // Certificates (PDF or images)
  @Column({ name: 'certificates', type: 'simple-array', nullable: true })
  certificates?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => Review, (review) => review.doctor)
  reviews: Review[];

  @OneToMany(() => Notification, (notification) => notification.receiver)
  notifications: Notification[];
}
