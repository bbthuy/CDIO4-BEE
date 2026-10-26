import { Controller, Get, UseGuards, Req, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { StatisticsService } from './statistics.service';
import { BaseController } from 'src/base/baseController';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/requirePermission.decorator';
import { PERMISSIONS } from '../common/constants/permission.constant';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';

@Controller('statistics')
@ApiTags('Statistics')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class StatisticsController extends BaseController {
  constructor(private readonly statisticsService: StatisticsService) {
    super();
  }

  // 1. API cho Admin
  @Get('admin/dashboard')
  @RequirePermission(PERMISSIONS.ADMIN_VIEW)
  @ApiOperation({ summary: 'Get Admin Dashboard Stats' })
  async getAdminStats(@Res() res: Response) {
    try {
      const data = await this.statisticsService.getAdminDashboard();
      return this.responseSuccess(res, {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: data
      });
    } catch (error) {
      return this.responseError(res, error, { message: error.response.message });
    }
  }

  // 2. API cho Bác sĩ
  @Get('doctor/dashboard')
  @RequirePermission(PERMISSIONS.REPORT_VIEW) // Quyền Bác sĩ
  @ApiOperation({ summary: 'Get Doctor Dashboard Stats' })
  async getDoctorStats(@Req() req: any, @Res() res: Response) {
    try {
      const userId = req.user.id; // Lấy ID từ token
      const data = await this.statisticsService.getDoctorDashboard(userId);
      return this.responseSuccess(res, {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: data
      });
    } catch (error) {
      return this.responseError(res, error, { message: error.response.message });
    }
  }

  // 3. API Biểu đồ
  @Get('admin/chart')
  @RequirePermission(PERMISSIONS.ADMIN_VIEW)
  async getChart(@Res() res: Response) {
    try {
      const data = await this.statisticsService.getRevenueChart();
      return this.responseSuccess(res, {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: data
      });
    } catch (error) {
      return this.responseError(res, error, { message: error.response.message });
    }
  }
}
