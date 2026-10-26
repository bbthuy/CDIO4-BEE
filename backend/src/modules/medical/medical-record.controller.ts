import { Controller, Post, Body, Get, Param, UseGuards, Req, Res, HttpStatus, Put } from '@nestjs/common';
import { Response } from 'express';
import { MedicalRecordService } from './medical-record.service';
import { CreateMedicalRecordDto } from './dto/createMedicalRecord.dto';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermission } from '../common/decorators/requirePermission.decorator';
import { PERMISSIONS } from '../common/constants/permission.constant';
import { BaseController } from 'src/base/baseController';
import { IUserRequest } from 'src/types/express';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { UpdateMedicalRecordDto } from './dto/updateMedicalRecord.dto';

@Controller('medical-records')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class MedicalRecordController extends BaseController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {
    super();
  }

  @Post()
  @RequirePermission(PERMISSIONS.DOCTOR_MEDICAL_RECORDS)
  async create(@Req() req: Request, @Res() res: Response, @CurrentUser() user: IUserRequest, @Body() dto: CreateMedicalRecordDto) {
    try {
      const result = await this.medicalRecordService.create(user.id, dto);
      return this.responseSuccess(res, result);
    } catch (error) {
      return this.responseError(res, error, { message: error.response.message });
    }
  }

  @Get('booking/:id')
  @RequirePermission(PERMISSIONS.PATIENT_VIEW)
  @RequirePermission(PERMISSIONS.USER_VIEW)
  async getByBooking(@Param('id') id: number, @Res() res: Response) {
    try {
      const result = await this.medicalRecordService.getByBookingId(id);
      return this.responseSuccess(res, result);
    } catch (error) {
      return this.responseError(res, error, { message: error.response.message });
    }
  }
  @Put(':id')
  @RequirePermission(PERMISSIONS.DOCTOR_UPDATE)
  async update(@Param('id') id: number, @Res() res: Response, @CurrentUser() user: IUserRequest, @Body() dto: UpdateMedicalRecordDto) {
    try {
      // Gọi service update
      const result = await this.medicalRecordService.update(id, user.id, dto);
      return this.responseSuccess(res, result);
    } catch (error) {
      return this.responseError(res, error, { message: error.message });
    }
  }
}
