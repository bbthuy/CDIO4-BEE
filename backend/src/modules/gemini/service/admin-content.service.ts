import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PendingContent } from '../entities/pending-content.entity';
import { ApprovedContent } from '../entities/approved_content.entity';
import { RejectedContent } from '../entities/rejected-content.entity';

@Injectable()
export class AdminContentService {
  constructor(
    @InjectRepository(PendingContent)
    private pendingRepo: Repository<PendingContent>,

    // Inject DataSource để dùng Transaction
    private dataSource: DataSource
  ) {}

  // 1. Lấy danh sách nội dung đang chờ duyệt
  async getPendingContents() {
    return await this.pendingRepo.find({
      order: { created_at: 'DESC' } // Mới nhất lên đầu
    });
  }

  // 2. DUYỆT (APPROVE): Pending -> Approved
  async approveContent(id: number, modifiedResponse?: string) {
    // Bắt đầu Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tìm nội dung trong Pending
      const pendingItem = await queryRunner.manager.findOne(PendingContent, { where: { id } });
      if (!pendingItem) {
        throw new NotFoundException(`Không tìm thấy nội dung Pending với ID ${id}`);
      }

      // Tạo bản ghi mới cho Approved
      const approvedItem = new ApprovedContent();
      // Map dữ liệu từ Pending sang Approved
      approvedItem.keyword = pendingItem.detected_keyword;
      // Nếu Admin có sửa câu trả lời thì lấy cái sửa, không thì lấy cái gốc
      approvedItem.response_template = modifiedResponse || pendingItem.ai_response;

      approvedItem.approved_by = 'admin';
      // Lưu vào bảng Approved
      await queryRunner.manager.save(ApprovedContent, approvedItem);

      // Xóa khỏi bảng Pending
      await queryRunner.manager.delete(PendingContent, id);

      // Commit Transaction (Xác nhận thành công)
      await queryRunner.commitTransaction();

      return { message: 'Đã duyệt nội dung thành công', data: approvedItem };
    } catch (err) {
      // Nếu có lỗi, rollback lại toàn bộ (không xóa Pending, không thêm Approved)
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // 3. TỪ CHỐI (REJECT): Pending -> Rejected
  async rejectContent(id: number, reason: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pendingItem = await queryRunner.manager.findOne(PendingContent, { where: { id } });
      if (!pendingItem) {
        throw new NotFoundException(`Không tìm thấy nội dung Pending với ID ${id}`);
      }

      // Tạo bản ghi Rejected
      const rejectedItem = new RejectedContent();
      rejectedItem.user_question = pendingItem.user_question;
      rejectedItem.ai_response = pendingItem.ai_response;
      rejectedItem.detected_keyword = pendingItem.detected_keyword;
      rejectedItem.rejection_reason = reason;

      await queryRunner.manager.save(RejectedContent, rejectedItem);
      await queryRunner.manager.delete(PendingContent, id);

      await queryRunner.commitTransaction();

      return { message: 'Đã từ chối nội dung', data: rejectedItem };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
