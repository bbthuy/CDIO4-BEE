import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserStatus, IUser, UserRole } from '../interfaces/user.interface';

@Entity('users')
export class User implements IUser {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string | null;

  @Column({ name: 'email', type: 'varchar', length: 191, nullable: false, unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ name: 'status', type: 'enum', enum: UserStatus, default: UserStatus.INACTIVE })
  status: UserStatus;

  @Column({ name: 'role', type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @Column({ name: 'failed_login_attempt', type: 'int', default: 0 })
  failedLoginAttempt: number;

  @Column({ name: 'failed_login_time', type: 'timestamp', nullable: true })
  failedLoginTime: Date | null;

  @Column({ name: 'refresh_token', type: 'varchar', length: 255, nullable: true })
  refreshToken: string | null;

  @Column({ name: 'is_project_owner', type: 'boolean', default: false })
  isProjectOwner: boolean;
}
