import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { User } from '../users/entities/user.entity';
import { CreateDoctorDto } from './dto/createDoctor.dto';
import { UpdateDoctorDto } from './dto/updateDoctor.dto';
import { UserRole, UserStatus } from '../users/interfaces/user.interface';
import { hashSHA256 } from '../../common/utils/hash';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.userRepository.findOne({
      where: { email: createDoctorDto.email },
    });
    if (existingUser) {
      throw new ConflictException(`Email "${createDoctorDto.email}" đã được sử dụng`);
    }

    // Tách fullName thành firstName + lastName
    const nameParts = createDoctorDto.fullName.trim().split(' ');
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ') || lastName;

    // Tạo mật khẩu mặc định (hash SHA256)
    const defaultPassword = hashSHA256('Doctor@123');

    // Tạo User account cho bác sĩ
    const user = this.userRepository.create({
      firstName,
      lastName,
      email: createDoctorDto.email,
      password: defaultPassword,
      role: UserRole.DOCTOR,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    });
    const savedUser = await this.userRepository.save(user);
    // Tạo Doctor profile
    const doctor = this.doctorRepository.create({
      userId: savedUser.id,
      fullName: createDoctorDto.fullName,
      specialtyId: createDoctorDto.specialtyId,
      experienceYears: createDoctorDto.experienceYears ?? 0,
      consultationFee: createDoctorDto.consultationFee ?? 0,
      bio: createDoctorDto.bio,
      education: createDoctorDto.education ?? [],
      avatarUrl: createDoctorDto.avatarUrl,
      certificateUrl: createDoctorDto.certificateUrl,
    });

    return this.doctorRepository.save(doctor);
  }

  async findAll(): Promise<Doctor[]> {
    return this.doctorRepository.find({
      relations: ['specialty', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['specialty', 'user'],
    });
    if (!doctor) {
      throw new NotFoundException(`Không tìm thấy bác sĩ với ID ${id}`);
    }
    return doctor;
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findOne(id);
    Object.assign(doctor, updateDoctorDto);
    return this.doctorRepository.save(doctor);
  }

  async remove(id: number): Promise<void> {
    const doctor = await this.findOne(id);
    await this.doctorRepository.remove(doctor);
  }
}
