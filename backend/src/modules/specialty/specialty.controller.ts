import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { SpecialtyService } from './specialty.service';
import { CreateSpecialtyDto } from './dto/createSpecialty.dto';
import { RequirePermission } from '../common/decorators/requirePermission.decorator';
import { PERMISSIONS } from '../common/constants/permission.constant';
import { BaseController } from 'src/base/baseController';
import { PermissionGuard } from '../common/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';

@Controller('specialties')
@ApiTags('Specialties')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SpecialtyController extends BaseController {
  constructor(private readonly specialtyService: SpecialtyService) {
    super();
  }

  // ========================= GET ALL =========================
  @Get()
  @RequirePermission(PERMISSIONS.SPECIALTY_VIEW)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all specialties' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Fetched successfully' })
  async getAll(@Req() req: Request, @Res() res: Response) {
    try {
      const response = await this.specialtyService.findAll();
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      return this.responseError(res, error, { message: error.response.message });
    }
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.SPECIALTY_VIEW)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get specialty by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Fetched successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Specialty not found' })
  async getById(@Req() req: Request, @Res() res: Response, @Param('id') id: number) {
    try {
      const response = await this.specialtyService.findOne(Number(id));
      return this.responseSuccess(res, response);
    } catch (error) {
      console.error(error);
      return this.responseError(res, error, {
        message: error.response?.message
      });
    }
  }

  // ========================= CREATE =========================
  @Post()
  @RequirePermission(PERMISSIONS.SPECIALTY_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new specialty' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created successfully' })
  async create(@Req() req: Request, @Res() res: Response, @Body() dto: CreateSpecialtyDto) {
    try {
      const response = await this.specialtyService.create(dto);
      return this.responseCreated(res, response);
    } catch (error) {
      console.log(error);
      return this.responseError(res, error, { message: error.response.message });
    }
  }

  // ========================= UPDATE =========================
  @Put(':id')
  @RequirePermission(PERMISSIONS.SPECIALTY_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update specialty by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Updated successfully' })
  async update(@Req() req: Request, @Res() res: Response, @Param('id') id: number, @Body() dto: CreateSpecialtyDto) {
    try {
      const response = await this.specialtyService.update(Number(id), dto);
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      return this.responseError(res, error, { message: error.response.message });
    }
  }

  // ========================= DELETE =========================
  @Delete(':id')
  @RequirePermission(PERMISSIONS.SPECIALTY_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete specialty by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Deleted successfully' })
  async delete(@Req() req: Request, @Res() res: Response, @Param('id') id: number) {
    try {
      const response = await this.specialtyService.remove(Number(id));
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      return this.responseError(res, error, { message: error.response.message });
    }
  }
}
