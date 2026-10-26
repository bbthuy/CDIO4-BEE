import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingContent } from '../entities/pending-content.entity';
import { RejectedContent } from '../entities/rejected-content.entity';
import { GeminiController } from '../controller/gemini.controller';
import { GeminiService } from '../service/gemini.service';
import { ApprovedContent } from '../entities/approved_content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovedContent, PendingContent, RejectedContent])],
  controllers: [GeminiController],
  providers: [GeminiService],
  exports: [GeminiService]
})
export class GeminiModule {}
