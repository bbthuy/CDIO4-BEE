import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Booking } from '../booking/entities/booking.entity';
import { BookingStatus } from '../booking/enums/bookingStatus.enum';
import { Doctor } from '../doctors/entities/doctor.entity';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';
import { MedicalRecord } from './entities/medical-record.entity';
import { CreateMedicalRecordDto } from './dto/createMedicalRecord.dto';
import { UpdateMedicalRecordDto } from './dto/updateMedicalRecord.dto';

@Injectable()
export class MedicalRecordService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepo: Repository<MedicalRecord>,

    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    private readonly dataSource: DataSource
  ) {}

  async create(doctorId: number, dto: CreateMedicalRecordDto) {
    // 1. Tìm Booking
    const booking = await this.bookingRepo.findOne({
      where: { id: dto.bookingId },
      relations: ['schedule', 'schedule.doctor'] // Để check quyền bác sĩ
    });

    if (!booking) throw new NotFoundException('Booking not found');

    // 2. Check quyền: Chỉ bác sĩ của lịch này mới được tạo hồ sơ
    // (doctorId truyền vào lấy từ req.user.id -> map sang doctor)
    const doctor = await this.doctorRepo.findOne({ where: { userId: doctorId } });
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(ERROR_MESSAGES.medicalRecord.INVALID_BOOKING_STATUS);
    }

    // 3. Check trạng thái: Phải là CONFIRMED mới được khám
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Lịch hẹn chưa được xác nhận hoặc đã hoàn thành');
    }

    // 4. Dùng Transaction để đảm bảo: Lưu Hồ sơ + Update Booking cùng thành công
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // A. Tạo Medical Record
      const record = this.medicalRecordRepo.create({
        bookingId: dto.bookingId,
        patientId: booking.userId,
        doctorId: doctor.id,
        subjective: dto.subjective,
        objective: dto.objective,
        assessment: dto.assessment,
        plan: dto.plan,
        diagnosis: dto.diagnosis,
        prescription: dto.medicines || [] // Lưu mảng thuốc dạng JSON
      });

      const savedRecord = await queryRunner.manager.save(record);

      // B. Update trạng thái Booking -> COMPLETED
      booking.status = BookingStatus.COMPLETED;
      await queryRunner.manager.save(booking);

      await queryRunner.commitTransaction();

      return {
        message: ERROR_MESSAGES.medicalRecord.CREATE_SUCCESS,
        data: savedRecord
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Lấy hồ sơ bệnh án theo Booking ID

  async getByBookingId(bookingId: number) {
    const record = await this.medicalRecordRepo.findOne({
      where: { bookingId },
      relations: ['doctor', 'doctor.user'],
      select: {
        id: true,
        bookingId: true,
        patientId: true,
        doctorId: true,
        subjective: true,
        objective: true,
        assessment: true,
        plan: true,
        diagnosis: true,
        prescription: true,
        createdAt: true,
        updatedAt: true,
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
          user: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!record) {
      throw new NotFoundException(ERROR_MESSAGES.medicalRecord.NOT_FOUND);
    }

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: record
    };
  }

  async update(id: number, userId: number, dto: UpdateMedicalRecordDto) {
    // 1. Tìm hồ sơ bệnh án
    const record = await this.medicalRecordRepo.findOne({
      where: { id },
      relations: ['doctor'] // Load thông tin bác sĩ để check quyền
    });

    if (!record) {
      throw new NotFoundException(ERROR_MESSAGES.medicalRecord.NOT_FOUND);
    }

    // 2. Tìm Bác sĩ đang đăng nhập
    const currentDoctor = await this.doctorRepo.findOne({ where: { userId } });
    if (!currentDoctor) {
      throw new NotFoundException('Bạn không phải là bác sĩ.');
    }

    // 3. Check quyền: Chỉ chủ nhân mới được sửa
    if (record.doctorId !== currentDoctor.id) {
      throw new NotFoundException('Bạn không có quyền chỉnh sửa hồ sơ bệnh án này.');
    }

    // 4. Xử lý dữ liệu cập nhật
    // Lưu ý: DTO gửi lên là 'medicines', nhưng DB lưu là 'prescription'
    if (dto.medicines) {
      record.prescription = dto.medicines;
    }

    // Map các trường SOAP
    if (dto.subjective) record.subjective = dto.subjective;
    if (dto.objective) record.objective = dto.objective;
    if (dto.assessment) record.assessment = dto.assessment;
    if (dto.plan) record.plan = dto.plan;
    if (dto.diagnosis) record.diagnosis = dto.diagnosis;

    // 5. Lưu vào DB
    const updatedRecord = await this.medicalRecordRepo.save(record);

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: updatedRecord
    };
  }
}
