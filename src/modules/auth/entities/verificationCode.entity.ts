import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

export enum VerificationPurpose {
  SIGNUP = 'signup',
  RESET_PASSWORD = 'reset_password'
}

/**
 * One row = one active 6-digit code sent by email.
 * Only an HMAC of the code is stored, never the code itself.
 */
@Entity('verification_codes')
@Index(['userId', 'purpose'])
export class VerificationCode {
  @PrimaryColumn({ name: 'id', type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'user_id', type: 'int', nullable: false })
  userId: number;

  @Column('enum', { name: 'purpose', enum: VerificationPurpose })
  purpose: VerificationPurpose;

  @Column({ name: 'code_hash', type: 'varchar', length: 64, nullable: false })
  codeHash: string;

  @Column({ name: 'expires_at', type: 'datetime', nullable: false })
  expiresAt: Date;

  @Column({ name: 'attempts', type: 'int', default: 0 })
  attempts: number;

  @Column({ name: 'created_at', type: 'datetime', nullable: false })
  createdAt: Date;
}
