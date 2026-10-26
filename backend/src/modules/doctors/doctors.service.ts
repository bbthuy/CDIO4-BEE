import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Doctor } from './entities/doctor.entity';
import { User } from '../users/entities/user.entity';
import { CreateDoctorDto } from './dto/createDoctor.dto';
import { UpdateDoctorDto } from './dto/updateDoctor.dto';

import * as bcrypt from 'bcryptjs';
import { UserRole, UserStatus } from '../users/interfaces/user.interface';
import { MailService } from 'src/common/mail/mail.service';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';
import { Specialty } from '../specialty/entities/specialty.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor) private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Specialty) private readonly specialtyRepo: Repository<Specialty>,
    private readonly mailService: MailService
  ) {}

  // ========================= GET ALL =========================
  async getAllDoctors() {
    const doctors = await this.doctorRepo.find({
      relations: ['user', 'specialty'],
      select: {
        id: true,
        avatar: true,
        experienceYears: true,
        consultationFee: true,
        bio: true,
        education: true,
        certificates: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        specialty: {
          id: true,
          name: true,
          description: true
        }
      }
    });

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: doctors
    };
  }

  // ========================= GET BY ID =========================
  async getDoctorById(id: number) {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['user', 'specialty'],
      select: {
        id: true,
        avatar: true,
        experienceYears: true,
        consultationFee: true,
        bio: true,
        education: true,
        certificates: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        specialty: {
          id: true,
          name: true,
          description: true
        }
      }
    });

    if (!doctor) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.doctor.DOCTOR_NOT_FOUND
      });
    }

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: doctor
    };
  }

  // ========================= CREATE =========================
  async createDoctor(dto: CreateDoctorDto) {
    // Check email exist
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
      withDeleted: true //  Lấy luôn user đã bị soft-delete
    });
    if (existing)
      throw new ConflictException({
        message: ERROR_MESSAGES.auth.EMAIL_ALREADY_EXISTS
      });

    const specialty = await this.specialtyRepo.findOne({ where: { id: dto.specialtyId } });
    if (!specialty) {
      throw new NotFoundException(ERROR_MESSAGES.specialty.SPECIALTY_NOT_FOUND);
    }

    const tempPassword = this.generateSecurePassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    const user = this.userRepo.create({
      firstName: dto.fullName,
      email: dto.email,
      password: hashed,
      role: UserRole.DOCTOR,
      status: UserStatus.ACTIVE,
      isActive: true
    });

    await this.userRepo.save(user);

    const doctor = this.doctorRepo.create({
      userId: user.id,
      specialtyId: dto.specialtyId,
      avatar: dto.avatarUrl || null,
      certificates: dto.certificateUrls || [],
      experienceYears: dto.experienceYears,
      consultationFee: dto.consultationFee,
      bio: dto.bio ?? null,
      education: dto.education ? dto.education.join('\n') : null
    });

    const saved = await this.doctorRepo.save(doctor);

    await this.mailService.sendEmail('Welcome to Clinic Care!', 'no-reply@cliniccare.com', user.email, {
      template: 'welcomeDoctor',
      context: {
        name: user.firstName,
        email: user.email,
        password: tempPassword,
        loginLink: `${process.env.WEB_APP_URL}/login`
      }
    });

    return {
      message: ERROR_MESSAGES.common.CREATED,
      data: saved
    };
  }

  private generateSecurePassword(): string {
    const length = 12; // Độ dài mật khẩu (đủ an toàn > 8)
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '@$!%*?&'; // Chỉ dùng các ký tự khớp với Regex của bạn

    // 1. Đảm bảo có ít nhất 1 ký tự cho mỗi loại
    let password = '';
    password += lower[Math.floor(Math.random() * lower.length)];
    password += upper[Math.floor(Math.random() * upper.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // 2. Điền ngẫu nhiên các ký tự còn lại cho đủ độ dài
    const allChars = lower + upper + numbers + special;
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // 3. Trộn lẫn (Shuffle) để các ký tự bắt buộc không nằm dồn ở đầu
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  // ========================= UPDATE =========================
  async updateDoctor(id: number, dto: UpdateDoctorDto) {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['user']
    });

    if (!doctor)
      throw new NotFoundException({
        message: ERROR_MESSAGES.doctor.DOCTOR_NOT_FOUND
      });

    const user = doctor.user;
    const oldEmail = user.email;

    // ========================
    // 1. CHECK EMAIL TRƯỚC
    // ========================
    if (dto.email && dto.email !== oldEmail) {
      const exist = await this.userRepo.findOne({
        where: { email: dto.email }
      });
      if (exist) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.auth.EMAIL_ALREADY_EXISTS
        });
      }
    }

    // ========================
    // 2. UPDATE USER
    // ========================
    if (dto.fullName) user.firstName = dto.fullName;
    if (dto.email) user.email = dto.email;

    await this.userRepo.save(user);

    // ========================
    // 3. UPDATE DOCTOR
    // ========================
    if (dto.specialtyId) doctor.specialtyId = dto.specialtyId;
    if (dto.experienceYears) doctor.experienceYears = dto.experienceYears;
    if (dto.consultationFee) doctor.consultationFee = dto.consultationFee;
    if (dto.bio) doctor.bio = dto.bio;
    if (dto.avatarUrl) doctor.avatar = dto.avatarUrl;
    if (dto.certificateUrls) doctor.certificates = dto.certificateUrls;
    if (dto.education) doctor.education = dto.education.join('\n');

    const saved = await this.doctorRepo.save(doctor);

    // ========================
    // 4. SEND EMAIL CHỈ KHI ĐỔI EMAIL
    // ========================
    if (dto.email && dto.email !== oldEmail) {
      await this.mailService.sendEmail('Clinic Care – Email Updated', 'no-reply@cliniccare.com', dto.email, {
        template: 'welcomeDoctor',
        context: {
          name: user.firstName,
          oldEmail,
          newEmail: dto.email,
          loginLink: `${process.env.WEB_APP_URL}/login`
        }
      });
    }

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: saved
    };
  }

  // ========================= DELETE =========================
  async deleteDoctor(id: number) {
    const doctor = await this.doctorRepo.findOne({ where: { id } });
    if (!doctor)
      throw new NotFoundException({
        message: ERROR_MESSAGES.doctor.DOCTOR_NOT_FOUND
      });

    await this.doctorRepo.softRemove(doctor);

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: { id }
    };
  }
}
