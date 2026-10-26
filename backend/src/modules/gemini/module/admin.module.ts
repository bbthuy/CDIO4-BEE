import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingContent } from '../entities/pending-content.entity';
import { ApprovedContent } from '../entities/approved_content.entity';
import { RejectedContent } from '../entities/rejected-content.entity';
import { AdminContentController } from '../controller/admin-content.controller';
import { AdminContentService } from '../service/admin-content.service';

@Module({
  imports: [TypeOrmModule.forFeature([PendingContent, ApprovedContent, RejectedContent])],
  controllers: [AdminContentController],
  providers: [AdminContentService]
})
export class AdminModule {}
