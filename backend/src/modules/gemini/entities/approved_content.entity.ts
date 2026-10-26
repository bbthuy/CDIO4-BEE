import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('approved_content')
export class ApprovedContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  keyword: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'text' })
  response_template: string;

  // FIX 1: Đổi sang varchar để lưu được chữ "Admin" và cho phép null để an toàn
  @Column({ type: 'varchar', length: 255, nullable: true })
  approved_by: string;

  // FIX 2: Dùng @CreateDateColumn để DB tự động điền ngày giờ hiện tại
  @CreateDateColumn()
  approved_at: Date;
}
