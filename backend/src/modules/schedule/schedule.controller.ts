import { Controller, Get, Post, Body, Param, Delete, Put, Query, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppointmentScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/createSchedule.dto';
import { UpdateScheduleDto } from './dto/updateSchedule.dto';
import { Request, Response } from 'express';
import { BaseController } from 'src/base/baseController';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/requirePermission.decorator';
import { PERMISSIONS } from '../common/constants/permission.constant';
import { IUserRequest } from 'src/types/express';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('schedules')
@ApiTags('Schedules')
export class AppointmentScheduleController extends BaseController {
  constructor(private readonly service: AppointmentScheduleService) {
    super();
  }

  // ======================= FE PUBLIC: XEM LỊCH =======================
  @Get(':doctorId')
  @Public()
  @ApiOperation({ summary: 'Lấy lịch khám theo bác sĩ (PUBLIC)' })
  async getByDoctor(@Res() res: Response, @Param('doctorId') doctorId: number, @Query('date') date?: string, @Query('time') time?: string) {
    try {
      const response = await this.service.findByDoctor(Number(doctorId), date, time);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ======================= CREATE (CẦN TOKEN) =======================
  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(PERMISSIONS.SCHEDULE_CREATE)
  @ApiOperation({ summary: 'Tạo khung giờ khám' })
  async create(@Req() req: Request, @CurrentUser() user: IUserRequest, @Res() res: Response, @Body() dto: CreateScheduleDto) {
    try {
      const response = await this.service.create(user.id, dto);
      return this.responseCreated(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ======================= UPDATE (CẦN TOKEN) =======================
  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(PERMISSIONS.SCHEDULE_UPDATE)
  @ApiOperation({ summary: 'Cập nhật khung giờ khám' })
  async update(@Req() req: Request, @Res() res: Response, @Param('id') id: number, @Body() dto: UpdateScheduleDto) {
    try {
      const response = await this.service.update(id, dto);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ======================= DELETE (CẦN TOKEN) =======================
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(PERMISSIONS.SCHEDULE_DELETE)
  @ApiOperation({ summary: 'Xóa khung giờ khám' })
  async delete(@Req() req: Request, @CurrentUser() user: IUserRequest, @Res() res: Response, @Param('id') id: number) {
    try {
      const response = await this.service.delete(id, user.id);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }
}
