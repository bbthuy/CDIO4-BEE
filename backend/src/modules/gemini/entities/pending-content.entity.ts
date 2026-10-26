import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('pending_content')
export class PendingContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  user_question: string;

  @Column({ type: 'text' })
  ai_response: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  detected_keyword: string;

  @Column({ type: 'varchar', length: 30, default: 'pending' })
  status: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
