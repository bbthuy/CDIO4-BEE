import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AdminContentService } from '../service/admin-content.service';
import { Public } from 'src/modules/auth/decorators/public.decorator';

@Controller('admin/content')
export class AdminContentController {
  constructor(private readonly adminContentService: AdminContentService) {}

  // GET: /api/admin/content/pending
  @Public()
  @Get('pending')
  async getPendingList() {
    return this.adminContentService.getPendingContents();
  }

  // POST: /api/admin/content/approve/1
  @Public()
  @Post('approve/:id')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body('modifiedResponse') modifiedResponse?: string // Cho phép Admin sửa câu trả lời trước khi duyệt
  ) {
    return this.adminContentService.approveContent(id, modifiedResponse);
  }

  // POST: /api/admin/content/reject/1
  @Public()
  @Post('reject/:id')
  async reject(@Param('id', ParseIntPipe) id: number, @Body('reason') reason: string) {
    return this.adminContentService.rejectContent(id, reason);
  }
}
