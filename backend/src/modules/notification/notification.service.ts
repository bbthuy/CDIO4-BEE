import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/createNotification.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';
import { User } from '../users/entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { SendToAllDoctorsDto } from './dto/sendToAllDoctors.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>
  ) {}

  // =======================CREATE===============================
  async send(dto: CreateNotificationDto) {
    // Check người nhận có tồn tại hay không
    const receiver = await this.doctorRepo.findOne({
      where: { id: dto.receiverId }
    });

    if (!receiver) {
      throw new BadRequestException(ERROR_MESSAGES.doctor.DOCTOR_NOT_FOUND);
    }

    const notification = this.notificationRepo.create({
      message: dto.message,
      receiverId: dto.receiverId
    });

    const saved = await this.notificationRepo.save(notification);

    return {
      message: ERROR_MESSAGES.common.CREATED,
      data: saved
    };
  }

  // ======================= SEND TO ALL DOCTORS ===============================
  async sendToAllDoctors(message: string) {
    // ← Chỉ nhận string
    const doctors = await this.doctorRepo.find({
      where: { deletedAt: null }
    });

    if (doctors.length === 0) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.doctor.DOCTOR_NOT_FOUND
      });
    }

    // Tạo thông báo cho từng bác sĩ
    const notifications = doctors.map((doctor) =>
      this.notificationRepo.create({
        message,
        receiverId: doctor.id
      })
    );

    // Lưu hàng loạt vào database
    const saved = await this.notificationRepo.save(notifications);

    return {
      message: ERROR_MESSAGES.common.CREATED,
      data: {
        totalSent: saved.length,
        doctorIds: doctors.map((d) => d.id),
        notifications: saved
      }
    };
  }
  // =======================GET ALL NOTIFICATIONS OF CURRENT USER================
  async getMyNotifications(userId: number) {
    const doctor = await this.doctorRepo.findOne({ where: { userId: userId } });
    if (!doctor) {
      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: []
      };
    }

    const data = await this.notificationRepo.find({
      where: { receiverId: doctor.id },
      order: { createdAt: 'DESC' }
    });

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data
    };
  }

  // =======================DELETE===============================
  async delete(id: number) {
    const noti = await this.notificationRepo.findOne({
      where: { id }
    });

    if (!noti) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.notification.NOTIFICATION_NOT_FOUND
      });
    }

    await this.notificationRepo.softRemove(noti);

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: { id }
    };
  }
}
