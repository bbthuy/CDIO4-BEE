import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';

import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/createDoctor.dto';
import { UpdateDoctorDto } from './dto/updateDoctor.dto';

import { RequirePermission } from '../common/decorators/requirePermission.decorator';
import { PERMISSIONS } from '../common/constants/permission.constant';
import { PermissionGuard } from '../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { BaseController } from 'src/base/baseController';
import { IUserRequest } from 'src/types/express';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('doctors')
@ApiTags('Doctors')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class DoctorsController extends BaseController {
  constructor(private readonly doctorsService: DoctorsService) {
    super();
  }

  // ========================= GET ALL =========================
  @Get()
  @Public()
  // @RequirePermission(PERMISSIONS.DOCTOR_VIEW_ALL)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all doctors' })
  async getAll(@Req() req: Request, @Res() res: Response) {
    try {
      const response = await this.doctorsService.getAllDoctors();
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ========================= GET DETAIL =========================
  @Get(':id')
  @Public()
  // @RequirePermission(PERMISSIONS.DOCTOR_VIEW)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get doctor by ID' })
  async getById(@Res() res: Response, @Param('id') id: number) {
    try {
      const response = await this.doctorsService.getDoctorById(Number(id));
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ========================= CREATE =========================
  @Post()
  @RequirePermission(PERMISSIONS.DOCTOR_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new doctor' })
  async create(@CurrentUser() user: IUserRequest, @Res() res: Response, @Body() dto: CreateDoctorDto) {
    try {
      const response = await this.doctorsService.createDoctor(dto);
      return this.responseCreated(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ========================= UPDATE =========================
  @Put(':id')
  @RequirePermission(PERMISSIONS.DOCTOR_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update doctor by ID' })
  async update(@Res() res: Response, @Param('id') id: number, @Body() dto: UpdateDoctorDto) {
    try {
      const response = await this.doctorsService.updateDoctor(Number(id), dto);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ========================= DELETE =========================
  @Delete(':id')
  @RequirePermission(PERMISSIONS.DOCTOR_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete doctor by ID' })
  async delete(@Res() res: Response, @Param('id') id: number) {
    try {
      const response = await this.doctorsService.deleteDoctor(Number(id));
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }
}
