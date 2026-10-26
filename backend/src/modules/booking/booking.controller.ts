import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';

import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/createBooking.dto';
import { CancelBookingDto } from './dto/cancelBooking.dto';

import { RequirePermission } from '../common/decorators/requirePermission.decorator';
import { PERMISSIONS } from '../common/constants/permission.constant';
import { PermissionGuard } from '../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { BaseController } from 'src/base/baseController';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { IUserRequest } from 'src/types/express';

@Controller('bookings')
@ApiTags('Bookings')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class BookingController extends BaseController {
  constructor(private readonly bookingService: BookingService) {
    super();
  }

  // ========================= CREATE (BỆNH NHÂN ĐẶT LỊCH) =========================
  @Post()
  @RequirePermission(PERMISSIONS.USER_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking' })
  async create(@Req() req: Request, @CurrentUser() user: IUserRequest, @Res() res: Response, @Body() dto: CreateBookingDto) {
    try {
      // Lấy ID từ token của người đăng nhập
      const userId = user.id;
      const response = await this.bookingService.createBooking({ ...dto, userId });
      return this.responseCreated(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ========================= GET DETAIL =========================
  @Get(':id')
  @RequirePermission(PERMISSIONS.USER_VIEW)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get booking detail by ID' })
  async getById(@Res() res: Response, @Param('id') id: number) {
    try {
      const response = await this.bookingService.getById(Number(id));
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ========================= GET BY USER (LỊCH SỬ KHÁM) =========================
  @Get()
  @RequirePermission(PERMISSIONS.USER_VIEW)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get booking history of current user' })
  async getByUser(@Req() req: any, @Res() res: Response, @Query('userId') queryUserId?: number) {
    try {
      // Nếu có truyền ?userId=123 (Admin xem) -> Lấy queryUserId
      // Nếu không (User tự xem) -> Lấy req.user.id
      const idToSearch = queryUserId ? Number(queryUserId) : req.user.id;

      const response = await this.bookingService.getByUser(idToSearch);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ========================= GET BY DOCTOR (LỊCH LÀM VIỆC) =========================
  @Get('doctor/:doctorId')
  @RequirePermission(PERMISSIONS.DOCTOR_VIEW_ALL)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get bookings by doctor ID' })
  async getByDoctor(@Res() res: Response, @Param('doctorId') doctorId: number) {
    try {
      const response = await this.bookingService.getByDoctor(Number(doctorId));
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ========================= CONFIRM (BÁC SĨ XÁC NHẬN) =========================
  @Patch(':id/confirm')
  @RequirePermission(PERMISSIONS.DOCTOR_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Doctor confirm booking' })
  async confirm(@Req() req: Request, @CurrentUser() user: IUserRequest, @Res() res: Response, @Param('id') id: number) {
    try {
      const doctorUserId = user.id;
      const response = await this.bookingService.confirmBooking(Number(id), doctorUserId);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ========================= CANCEL (HỦY LỊCH) =========================
  @Patch(':id/cancel')
  @RequirePermission(PERMISSIONS.DOCTOR_UPDATE) // Hoặc USER_UPDATE tùy logic
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel booking' })
  async cancel(@Req() req: Request, @CurrentUser() user: IUserRequest, @Res() res: Response, @Param('id') id: number, @Body() dto: CancelBookingDto) {
    try {
      const userId = user.id;
      const response = await this.bookingService.cancelBooking(Number(id), userId, dto.reason);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ========================= DELETE (ADMIN XÓA) =========================
  @Delete(':id')
  @RequirePermission(PERMISSIONS.BOOKING_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete booking' })
  async delete(@Res() res: Response, @Param('id') id: number) {
    try {
      const response = await this.bookingService.delete(Number(id));
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ========================= TEST EMAIL (DEV ONLY) =========================
  // Hàm này chỉ dùng để test lúc dev, nên xóa khi lên production
  @Post('test-success/:id')
  @RequirePermission(PERMISSIONS.USER_CREATE)
  async testPaymentSuccess(@Res() res: Response, @Param('id') id: number) {
    try {
      await this.bookingService.completeBookingPayment(Number(id));

      // 👇 SỬA LẠI ĐOẠN NÀY
      return this.responseSuccess(res, {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: 'Test payment success triggered'
      });
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }
}
