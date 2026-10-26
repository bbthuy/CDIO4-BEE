import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Specialty } from './entities/specialty.entity';
import { CreateSpecialtyDto } from './dto/createSpecialty.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';
import { BadRequestException } from 'src/common/exceptions/badRequest.exception';
import { Doctor } from '../doctors/entities/doctor.entity';

@Injectable()
export class SpecialtyService {
  constructor(
    @InjectRepository(Specialty)
    private readonly repo: Repository<Specialty>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>
  ) {}

  async findAll() {
    const data = await this.repo.find();
    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data
    };
  }

  async findOne(id: number) {
    const specialty = await this.repo.findOne({ where: { id } });

    if (!specialty) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.specialty.SPECIALTY_NOT_FOUND
      });
    }

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: specialty
    };
  }

  async create(dto: CreateSpecialtyDto) {
    const exist = await this.repo.findOne({
      where: { name: dto.name }
    });

    if (exist) {
      throw new BadRequestException({
        message: ERROR_MESSAGES.specialty.SPECIALTY_NAME_ALREADY_EXISTS
      });
    }

    const newSpecialty = this.repo.create(dto);
    const data = await this.repo.save(newSpecialty);

    return {
      message: ERROR_MESSAGES.common.CREATED,
      data
    };
  }

  async update(id: number, dto: CreateSpecialtyDto) {
    //  1. Kiểm tra trùng tên với chuyên khoa khác
    const existName = await this.repo.findOne({
      where: {
        name: dto.name,
        id: Not(id)
      }
    });

    if (existName) {
      throw new BadRequestException({
        message: ERROR_MESSAGES.specialty.SPECIALTY_NAME_ALREADY_EXISTS
      });
    }

    //  2. Kiểm tra chuyên khoa có tồn tại không
    const exist = await this.findOne(id);

    //  3. Merge & save
    const merged = { ...exist.data, ...dto };
    const data = await this.repo.save(merged);

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data
    };
  }

  async remove(id: number) {
    const exist = await this.findOne(id);

    const doctorCount = await this.doctorRepo.count({
      where: {
        specialty: { id }
      }
    });

    if (doctorCount > 0) {
      throw new ConflictException({
        message: 'SPECIALTY_IS_IN_USE',
        detail: `Chuyên khoa đang có ${doctorCount} bác sĩ, không thể xoá`
      });
    }

    await this.repo.remove(exist.data);

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: { id }
    };
  }
}
