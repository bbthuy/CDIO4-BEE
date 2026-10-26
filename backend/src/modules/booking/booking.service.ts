import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

import { Booking } from './entities/booking.entity';
import { AppointmentSchedule } from '../schedule/entities/schedule.entity';
import { BookingStatus } from './enums/bookingStatus.enum';
import { CreateBookingDto } from './dto/createBooking.dto';
import { MailService } from 'src/common/mail/mail.service';
import { MAIL_FROM, TEMPLATE_MAIL } from 'src/common/mail/templates';
import { SepayService } from '../sepay/sepay.service';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(AppointmentSchedule)
    private readonly scheduleRepo: Repository<AppointmentSchedule>,
    @Inject(forwardRef(() => SepayService))
    private readonly sepayService: SepayService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService
  ) {}

  // =================================================================
  // 1. TẠO BOOKING (BỆNH NHÂN ĐẶT LỊCH)
  // =================================================================
  async createBooking(dto: CreateBookingDto) {
    const schedule = await this.scheduleRepo.findOne({
      where: { id: dto.scheduleId },
      relations: ['doctor', 'doctor.user']
    });

    if (!schedule) throw new NotFoundException(ERROR_MESSAGES.schedule.NOT_FOUND);

    if (schedule.bookedPatients >= schedule.maxPatients) {
      throw new BadRequestException(ERROR_MESSAGES.schedule.INVALID_SCHEDULE);
    }

    // Check online an toàn (chữ thường)
    const isOnline = schedule.appointmentType?.toLowerCase() === 'online';
    const amount = schedule.doctor.consultationFee || 0;

    // Tạo Booking
    const booking = this.bookingRepo.create({
      scheduleId: dto.scheduleId,
      userId: dto.userId,
      note: dto.note,
      price: amount,
      status: BookingStatus.PENDING
    });

    const savedBooking = await this.bookingRepo.save(booking);

    // Giữ chỗ (Tăng slot tạm thời)
    schedule.bookedPatients += 1;
    await this.scheduleRepo.save(schedule);

    // --- LOGIC ONLINE (BẮT BUỘC THANH TOÁN) ---
    if (isOnline) {
      const orderCode = `CLINIC${savedBooking.id}`;
      const paymentInfo = await this.sepayService.createPayment({
        orderCode: orderCode,
        amount: amount
      });

      return {
        message: ERROR_MESSAGES.booking.PAYMENT_REQUIRED,
        data: {
          booking: savedBooking,
          requirePayment: true,
          payment: {
            qrUrl: paymentInfo.qrUrl,
            amount: amount,
            orderCode: orderCode,
            bankInfo: paymentInfo.bankInfo
          }
        }
      };
    }

    // --- LOGIC OFFLINE (CHỜ BÁC SĨ DUYỆT) ---
    else {
      return {
        message: ERROR_MESSAGES.booking.CREATE_SUCCESS,
        data: {
          booking: savedBooking,
          requirePayment: false
        }
      };
    }
  }

  // =================================================================
  // 2. XỬ LÝ THANH TOÁN THÀNH CÔNG (ONLINE) - GỌI TỪ SEPAY
  // =================================================================
  async completeBookingPayment(bookingId: number) {
    this.logger.log(`Xử lý thanh toán Booking ID: ${bookingId}`);

    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['schedule', 'schedule.doctor', 'schedule.doctor.user', 'user']
    });

    if (!booking || booking.status === BookingStatus.CONFIRMED) return;

    // Cập nhật CONFIRMED
    booking.status = BookingStatus.CONFIRMED;
    await this.bookingRepo.save(booking);

    // Gửi mail vé khám Online (Gửi cho cả 2 người)
    await this.sendMailConfirmedOnline(booking);
  }

  // =================================================================
  // 3. BÁC SĨ XÁC NHẬN LỊCH (OFFLINE)
  // =================================================================
  async confirmBooking(bookingId: number, doctorId: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['schedule', 'schedule.doctor', 'schedule.doctor.user', 'user']
    });

    if (!booking) throw new NotFoundException(ERROR_MESSAGES.booking.NOT_FOUND);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(ERROR_MESSAGES.booking.ALREADY_CONFIRMED);
    }

    booking.status = BookingStatus.CONFIRMED;
    await this.bookingRepo.save(booking);

    // Gửi mail vé khám Offline (Chỉ gửi Bệnh nhân)
    await this.sendMailConfirmedOffline(booking);

    return {
      message: ERROR_MESSAGES.booking.CONFIRM_SUCCESS,
      data: { id: bookingId, status: BookingStatus.CONFIRMED }
    };
  }

  // =================================================================
  // 4. HỦY LỊCH (BÁC SĨ HOẶC USER) -> GỬI MAIL CẢ 2
  // =================================================================
  async cancelBooking(bookingId: number, userId: number, reason: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['schedule', 'schedule.doctor', 'schedule.doctor.user', 'user']
    });

    if (!booking) throw new NotFoundException(ERROR_MESSAGES.booking.NOT_FOUND);

    // Hoàn lại slot nếu chưa hủy
    const schedule = booking.schedule;
    if (booking.status !== BookingStatus.CANCELLED) {
      schedule.bookedPatients = Math.max(0, schedule.bookedPatients - 1);
      await this.scheduleRepo.save(schedule);
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancelReason = reason;
    await this.bookingRepo.save(booking);

    // Gửi mail thông báo hủy cho cả 2 bên
    await this.sendMailCancelled(booking, reason);

    return {
      message: ERROR_MESSAGES.booking.CANCEL_SUCCESS,
      data: { id: bookingId, status: BookingStatus.CANCELLED }
    };
  }

  // =================================================================
  // 5. LẤY CHI TIẾT BOOKING (GET BY ID) - ĐẦY ĐỦ THÔNG TIN
  // =================================================================
  async getById(id: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['schedule', 'schedule.doctor', 'schedule.doctor.user', 'schedule.doctor.specialty', 'user'],
      select: {
        id: true,
        status: true,
        note: true,
        price: true,
        createdAt: true,
        updatedAt: true,

        schedule: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          appointmentType: true,

          doctor: {
            id: true,
            userId: true,
            specialtyId: true,
            avatar: true,
            experienceYears: true,
            consultationFee: true,
            bio: true,
            education: true,
            certificates: true,

            specialty: {
              id: true,
              name: true
            },

            user: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          }
        },

        user: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    });

    if (!booking) throw new NotFoundException(ERROR_MESSAGES.booking.NOT_FOUND);

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: booking
    };
  }

  // =================================================================
  // 6. LỊCH SỬ KHÁM CỦA BỆNH NHÂN (GET BY USER)
  // =================================================================
  async getByUser(userId: number) {
    const bookings = await this.bookingRepo.find({
      where: { userId },
      relations: ['schedule', 'schedule.doctor', 'schedule.doctor.user', 'schedule.doctor.specialty'],
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        status: true,
        price: true,
        createdAt: true,

        schedule: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          appointmentType: true,

          doctor: {
            id: true,
            avatar: true,
            specialty: { name: true },
            user: { firstName: true, lastName: true }
          }
        }
      }
    });

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: bookings
    };
  }

  // =================================================================
  // 7. DANH SÁCH LỊCH CỦA BÁC SĨ (GET BY DOCTOR)
  // =================================================================
  async getByDoctor(doctorId: number) {
    const bookings = await this.bookingRepo.find({
      where: {
        schedule: { doctorId: doctorId }
      },
      relations: ['schedule', 'user'],
      order: {
        schedule: { date: 'DESC', startTime: 'ASC' }
      },
      select: {
        id: true,
        status: true,
        note: true,
        price: true,

        user: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        },

        schedule: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          appointmentType: true
        }
      }
    });

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: bookings
    };
  }

  async delete(id: number) {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) throw new NotFoundException(ERROR_MESSAGES.booking.NOT_FOUND);

    await this.bookingRepo.delete(id);
    return {
      message: ERROR_MESSAGES.booking.DELETE_SUCCESS,
      data: { id }
    };
  }

  // -----------------------------------------------------------------------
  // 👇👇👇 CÁC HÀM GỬI MAIL (PRIVATE) 👇👇👇
  // -----------------------------------------------------------------------

  // A. MAIL ONLINE (Gửi Bệnh nhân + Bác sĩ)
  private async sendMailConfirmedOnline(booking: Booking) {
    try {
      const patientEmail = booking.user.email;
      const doctorEmail = booking.schedule.doctor.user.email;
      const meetingLink = 'https://meet.google.com/abc-xyz-123'; // Link mẫu

      const contextData = this.prepareMailContext(booking);
      contextData['meetingLink'] = meetingLink;
      contextData['address'] = 'Phòng khám Online (Google Meet)';

      // 1. Gửi Bệnh nhân (Template: bookingOnline.hbs)
      await this.mailService.sendEmail(TEMPLATE_MAIL.BOOKING_ONLINE.subject, MAIL_FROM, patientEmail, {
        template: TEMPLATE_MAIL.BOOKING_ONLINE.name,
        context: contextData
      });

      // 2. Gửi Bác sĩ
      if (doctorEmail) {
        await this.mailService.sendEmail(`Lịch khám mới: ${contextData['patientName']}`, MAIL_FROM, doctorEmail, {
          template: TEMPLATE_MAIL.BOOKING_ONLINE.name,
          context: {
            ...contextData,
            patientName: `Bác sĩ (Bệnh nhân: ${contextData['patientName']})`
          }
        });
      }

      this.logger.log(`📧 Đã gửi mail Online cho Booking ${booking.id}`);
    } catch (e) {
      this.logger.error(`Lỗi gửi mail Online: ${e.message}`);
    }
  }

  // B. MAIL OFFLINE (Gửi Bệnh nhân)
  private async sendMailConfirmedOffline(booking: Booking) {
    try {
      const patientEmail = booking.user.email;
      const contextData = this.prepareMailContext(booking);
      contextData['address'] = '120 Hoàng Minh Thảo, Đà Nẵng';

      // Gửi Bệnh nhân (Template: bookingOffline.hbs)
      await this.mailService.sendEmail(TEMPLATE_MAIL.BOOKING_OFFLINE.subject, MAIL_FROM, patientEmail, {
        template: TEMPLATE_MAIL.BOOKING_OFFLINE.name,
        context: contextData
      });

      this.logger.log(`📧 Đã gửi mail Offline cho Booking ${booking.id}`);
    } catch (e) {
      this.logger.error(`Lỗi gửi mail Offline: ${e.message}`);
    }
  }

  // C. MAIL HỦY (Gửi Bệnh nhân + Bác sĩ)
  private async sendMailCancelled(booking: Booking, reason: string) {
    try {
      const patientEmail = booking.user.email;
      const doctorEmail = booking.schedule.doctor.user.email;

      // Lấy URL web từ env
      const websiteUrl = this.configService.get('WEB_APP_URL') || 'http://localhost:3000';

      const contextData = this.prepareMailContext(booking);
      contextData['reason'] = reason;
      contextData['websiteUrl'] = websiteUrl;

      // 1. Báo Bệnh nhân (Template: bookingCancelled.hbs)
      await this.mailService.sendEmail(TEMPLATE_MAIL.BOOKING_CANCELLED.subject, MAIL_FROM, patientEmail, {
        template: TEMPLATE_MAIL.BOOKING_CANCELLED.name,
        context: contextData
      });

      // 2. Báo Bác sĩ
      if (doctorEmail) {
        await this.mailService.sendEmail(`Lịch khám bị hủy: ${contextData['patientName']}`, MAIL_FROM, doctorEmail, {
          template: TEMPLATE_MAIL.BOOKING_CANCELLED.name,
          context: contextData
        });
      }

      this.logger.log(`📧 Đã gửi mail Hủy cho Booking ${booking.id}`);
    } catch (e) {
      this.logger.error(`Lỗi gửi mail Hủy: ${e.message}`);
    }
  }

  // Helper: Chuẩn bị dữ liệu chung cho mail
  private prepareMailContext(booking: Booking) {
    const rawDate = booking.schedule?.date || '';
    const [year, month, day] = rawDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    const patientName = booking.user?.lastName ? `${booking.user.firstName} ${booking.user.lastName}` : booking.user?.firstName;
    const doctorName = booking.schedule?.doctor?.user?.firstName
      ? `BS. ${booking.schedule.doctor.user.firstName} ${booking.schedule.doctor.user.lastName}`
      : 'Bác sĩ';

    // Link Calendar
    const calendarTitle = encodeURIComponent(`Lịch khám: ${doctorName}`);
    const calendarDesc = encodeURIComponent(`Lịch hẹn tại CLINIC CARE`);
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calendarTitle}&details=${calendarDesc}`;
    const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${calendarTitle}&body=${calendarDesc}`;

    return {
      patientName,
      doctorName,
      time: booking.schedule?.startTime?.slice(0, 5) || '00:00',
      date: formattedDate,
      price: (booking.price || 0).toLocaleString('vi-VN'),
      // 🔥 FIX LỖI appointmentType không có trong template
      appointmentType: booking.schedule?.appointmentType === 'online' ? 'Tư vấn Online qua Video Call' : 'Khám trực tiếp tại phòng khám',
      addToGoogleCalendarUrl: googleCalendarUrl,
      addToOutlookCalendarUrl: outlookCalendarUrl
    };
  }

  // CRON
  @Cron('0 */30 * * * *') // Chạy mỗi 30 phút
  async sendReminders() {
    const now = new Date();
    this.logger.log('Đang quét lịch để gửi nhắc nhở...');

    // 1. Tìm các lịch sắp tới mà chưa nhắc
    const bookings = await this.bookingRepo.find({
      where: {
        status: BookingStatus.CONFIRMED,
        isReminderSent: false
      },
      relations: ['schedule', 'user']
    });

    for (const booking of bookings) {
      // Ghép ngày + giờ thành đối tượng Date
      const appointmentTime = new Date(`${booking.schedule.date}T${booking.schedule.startTime}`);

      // Tính khoảng cách thời gian (phút)
      const diffMs = appointmentTime.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);

      // 2. Nếu lịch khám diễn ra trong vòng 1 tiếng tới (0 - 60 phút)
      if (diffMinutes > 0 && diffMinutes <= 60) {
        // 3. Gửi Email
        await this.mailService.sendEmail('Nhắc nhở: Lịch khám sắp diễn ra', MAIL_FROM, booking.user.email, {
          template: 'bookingReminderPatient', // Template riêng cho nhắc lịch
          context: {
            patientName: booking.user.lastName,
            time: booking.schedule.startTime,
            date: booking.schedule.date
          }
        });

        // 4. Đánh dấu là đã nhắc
        booking.isReminderSent = true;
        await this.bookingRepo.save(booking);

        this.logger.log(`Đã gửi nhắc nhở cho Booking ID: ${booking.id}`);
      }
    }
  }
}
