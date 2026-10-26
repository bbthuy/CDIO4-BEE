import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateReviewDto } from './dto/createReview.dto';
import { Review } from './entities/reviews.entities';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';
import { User } from '../users/entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Booking } from '../booking/entities/booking.entity';
import { BookingStatus } from '../booking/enums/bookingStatus.enum';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>
  ) {}

  // ========================= CREATE =========================
  async create(userId: number, dto: CreateReviewDto) {
    const doctor = await this.doctorRepo.findOne({ where: { id: dto.doctorId } });
    if (!doctor) throw new NotFoundException(ERROR_MESSAGES.doctor.DOCTOR_NOT_FOUND);

    const review = this.reviewRepo.create({
      rating: dto.rating,
      comment: dto.comment,
      doctorId: dto.doctorId,
      userId: userId
    });

    const savedReview = await this.reviewRepo.save(review);
    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: savedReview
    };
  }

  // ========================= GET BY DOCTOR =========================
  // review.service.ts

  async getReviewsByDoctor(doctorId: number) {
    // 1. Kiểm tra bác sĩ tồn tại (CẢ SOFT DELETED)
    const existDoctor = await this.doctorRepo.findOne({
      where: { id: doctorId },
      withDeleted: true // ← THÊM DÒNG NÀY
    });

    if (!existDoctor) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.doctor.DOCTOR_NOT_FOUND
      });
    }

    // 2. Query reviews
    const data = await this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser') // ← Quan trọng
      .where('review.doctorId = :doctorId', { doctorId })
      .orderBy('review.createdAt', 'DESC')
      .getMany();

    const mapped = data.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      userId: r.userId,
      doctorId: r.doctorId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      userName: r.user ? `${r.user.firstName} ${r.user.lastName ?? ''}`.trim() : null,
      doctorName: r.doctor?.user ? `${r.doctor.user.firstName} ${r.doctor.user.lastName ?? ''}`.trim() : null
    }));

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: mapped
    };
  }

  // ========================= DELETE =========================
  async delete(id: number, userId: number) {
    const review = await this.reviewRepo.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.review.REVIEW_NOT_FOUND
      });
    }

    await this.reviewRepo.softRemove(review);

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: { id }
    };
  }
}
