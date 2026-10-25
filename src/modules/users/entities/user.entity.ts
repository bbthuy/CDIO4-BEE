import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { UserStatus, UserRole, IUser } from '../interfaces/user.interface';

@Entity('users')
export class User implements IUser {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: false })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: false })
  lastName: string;

  @Column({ name: 'email', type: 'varchar', length: 191, nullable: false, unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column('enum', { name: 'status', default: UserStatus.INACTIVE, enum: UserStatus })
  status: UserStatus;

  @Column('enum', { name: 'role', default: UserRole.PATIENT, enum: UserRole })
  role: UserRole;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
