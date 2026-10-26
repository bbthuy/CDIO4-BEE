import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn } from 'typeorm';
import { ILoginHistory, LoginMethod, LoginStatus } from '../interfaces/loginHistory.interface';

@Entity('login_histories')
export class LoginHistory implements ILoginHistory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'status', type: 'enum', enum: LoginStatus, nullable: false })
  status: LoginStatus;

  @Column({ name: 'login_method', type: 'enum', enum: LoginMethod, nullable: false })
  method: LoginMethod;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @Column({ name: 'credential', type: 'varchar', length: 255, nullable: false })
  credential: string;
}
