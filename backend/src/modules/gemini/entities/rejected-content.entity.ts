import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('rejected_content')
export class RejectedContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  user_question: string;

  @Column({ type: 'text' })
  ai_response: string;

  @Column({ type: 'text', nullable: true })
  detected_keyword: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @CreateDateColumn()
  rejected_at: Date;
}
