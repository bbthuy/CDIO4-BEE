import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialty } from './entities/specialty.entity';
import { CreateSpecialtyDto } from './dto/createSpecialty.dto';
import { UpdateSpecialtyDto } from './dto/updateSpecialty.dto';

@Injectable()
export class SpecialtyService {
  constructor(
    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,
  ) {}

  async create(createSpecialtyDto: CreateSpecialtyDto): Promise<Specialty> {
    const existing = await this.specialtyRepository.findOne({
      where: { name: createSpecialtyDto.name },
    });
    if (existing) {
      throw new ConflictException(`Chuyên khoa "${createSpecialtyDto.name}" đã tồn tại`);
    }
    const specialty = this.specialtyRepository.create(createSpecialtyDto);
    return this.specialtyRepository.save(specialty);
  }

  async findAll(): Promise<Specialty[]> {
    return this.specialtyRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Specialty> {
    const specialty = await this.specialtyRepository.findOne({ where: { id } });
    if (!specialty) {
      throw new NotFoundException(`Không tìm thấy chuyên khoa với ID ${id}`);
    }
    return specialty;
  }

  async update(id: number, updateSpecialtyDto: UpdateSpecialtyDto): Promise<Specialty> {
    const specialty = await this.findOne(id);
    if (updateSpecialtyDto.name && updateSpecialtyDto.name !== specialty.name) {
      const existing = await this.specialtyRepository.findOne({
        where: { name: updateSpecialtyDto.name },
      });
      if (existing) {
        throw new ConflictException(`Chuyên khoa "${updateSpecialtyDto.name}" đã tồn tại`);
      }
    }
    Object.assign(specialty, updateSpecialtyDto);
    return this.specialtyRepository.save(specialty);
  }

  async remove(id: number): Promise<void> {
    const specialty = await this.findOne(id);
    await this.specialtyRepository.remove(specialty);
  }
}
