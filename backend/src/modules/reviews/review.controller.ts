import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/createReview.dto';

import { RequirePermission } from '../common/decorators/requirePermission.decorator';
import { PERMISSIONS } from '../common/constants/permission.constant';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { BaseController } from 'src/base/baseController';
import { IUserRequest } from 'src/types/express';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ReviewController extends BaseController {
  constructor(private readonly reviewService: ReviewService) {
    super();
  }

  // ========================= CREATE =========================
  @Post()
  @RequirePermission(PERMISSIONS.REVIEW_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new review' })
  async create(@Req() req: Request, @Res() res: Response, @CurrentUser() user: IUserRequest, @Body() dto: CreateReviewDto) {
    try {
      const response = await this.reviewService.create(user.id, dto);
      return this.responseCreated(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ========================= GET REVIEWS BY DOCTOR =========================
  @Get('doctor/:doctorId')
  @Public()
  // @RequirePermission(PERMISSIONS.REVIEW_VIEW)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all reviews of a doctor' })
  async getByDoctor(@Req() req: Request, @Res() res: Response, @Param('doctorId') doctorId: number) {
    try {
      const response = await this.reviewService.getReviewsByDoctor(Number(doctorId));
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }

  // ========================= DELETE =========================
  @Delete(':id')
  // @RequirePermission(PERMISSIONS.REVIEW_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a review by ID' })
  async delete(@Req() req: Request, @CurrentUser() user: IUserRequest, @Res() res: Response, @Param('id') id: number) {
    try {
      const response = await this.reviewService.delete(Number(id), user.id);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, {
        message: error?.response?.message
      });
    }
  }
}
