import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { BaseController } from 'src/base/baseController';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/requirePermission.decorator';
import { PERMISSIONS } from '../common/constants/permission.constant';

import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/createNotification.dto';
import { SendToAllDoctorsDto } from './dto/sendToAllDoctors.dto';
import { IUserRequest } from 'src/types/express';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class NotificationController extends BaseController {
  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  // ================= SEND TO ONE DOCTOR =================
  @Post('send')
  @RequirePermission(PERMISSIONS.NOTIFICATION_SEND)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin gửi thông báo cho 1 bác sĩ' })
  async send(@Res() res: Response, @Body() dto: CreateNotificationDto) {
    try {
      const response = await this.notificationService.send(dto);
      return this.responseCreated(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ================= SEND TO ALL DOCTORS =================
  @Post('send-all')
  @RequirePermission(PERMISSIONS.NOTIFICATION_SEND)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin gửi thông báo cho TẤT CẢ bác sĩ' })
  async sendToAll(@Res() res: Response, @Body() dto: SendToAllDoctorsDto) {
    // ← SỬA LẠI
    try {
      const response = await this.notificationService.sendToAllDoctors(dto.message);
      return this.responseCreated(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ================= GET MY NOTIFICATIONS =================
  @Get('my')
  @RequirePermission(PERMISSIONS.NOTIFICATION_VIEW)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bác sĩ xem thông báo của mình' })
  async getMy(@Req() req: Request, @CurrentUser() user: IUserRequest, @Res() res: Response) {
    try {
      const userId = user.id;
      const response = await this.notificationService.getMyNotifications(userId);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ================= DELETE =================
  @Delete(':id')
  @RequirePermission(PERMISSIONS.NOTIFICATION_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa thông báo theo ID' })
  async delete(@Res() res: Response, @Param('id') id: number) {
    try {
      const response = await this.notificationService.delete(Number(id));
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }
}
