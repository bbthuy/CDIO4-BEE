import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppointmentSchedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/createSchedule.dto';
import { UpdateScheduleDto } from './dto/updateSchedule.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';
import { Doctor } from '../doctors/entities/doctor.entity';
import { ForbiddenException } from 'src/common/exceptions/forbidden.exception';

@Injectable()
export class AppointmentScheduleService {
  constructor(
    @InjectRepository(AppointmentSchedule)
    private readonly repo: Repository<AppointmentSchedule>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>
  ) {}

  // ========================= CREATE =========================
  async create(userId: number, dto: CreateScheduleDto) {
    // 1. Tìm bác sĩ theo userId
    const doctor = await this.doctorRepo.findOne({
      where: { userId: userId }
    });

    if (!doctor) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.doctor.DOCTOR_NOT_FOUND
      });
    }

    // 2. KIỂM TRA TRÙNG KHUNG GIỜ (CÙNG NGÀY + GIỜ + LOẠI KHÁM)
    const existedSlot = await this.repo.findOne({
      where: {
        doctor: { id: doctor.id },
        date: dto.date,
        startTime: dto.startTime,
        appointmentType: dto.appointmentType
      }
    });

    if (existedSlot) {
      throw new BadRequestException({
        message: 'Khung giờ này đã tồn tại, vui lòng chọn khung giờ khác!'
      });
    }

    // 3. Tạo lịch mới
    const schedule = this.repo.create({
      ...dto,
      doctor: doctor
    });

    const saved = await this.repo.save(schedule);

    return {
      message: ERROR_MESSAGES.common.CREATED,
      data: saved
    };
  }

  // ========================= GET BY DOCTOR =========================
  async findByDoctor(doctorId: number, date?: string, time?: string) {
    const schedules = await this.repo.find({
      where: {
        doctorId,
        ...(date && { date }),
        ...(time && { startTime: time })
      },
      order: { startTime: 'ASC' }
    });

    if (!schedules || schedules.length === 0) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.schedule?.NOT_FOUND || 'Không tìm thấy lịch khám phù hợp'
      });
    }

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: schedules
    };
  }

  // ========================= UPDATE =========================
  async update(id: number, dto: UpdateScheduleDto) {
    const schedule = await this.repo.findOne({ where: { id } });

    if (!schedule) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.schedule?.NOT_FOUND || 'Lịch khám không tồn tại'
      });
    }

    await this.repo.update(id, dto);
    const updated = await this.repo.findOne({ where: { id } });

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: updated
    };
  }

  // ========================= DELETE =========================
  // Thêm tham số userId vào hàm update/delete để check quyền
  async delete(id: number, userId: number) {
    const schedule = await this.repo.findOne({
      where: { id },
      relations: ['doctor'] // Load thông tin bác sĩ để check
    });

    if (!schedule) {
      throw new NotFoundException(ERROR_MESSAGES.schedule.NOT_FOUND);
    }

    await this.repo.delete(id);

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: { id }
    };
  }
}
