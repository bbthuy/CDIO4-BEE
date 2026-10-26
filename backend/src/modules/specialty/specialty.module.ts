import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Specialty } from './entities/specialty.entity';
import { SpecialtyController } from './specialty.controller';
import { SpecialtyService } from './specialty.service';
import { Doctor } from '../doctors/entities/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Specialty, Doctor])],
  controllers: [SpecialtyController],
  providers: [SpecialtyService],
  exports: [SpecialtyService]
})
export class SpecialtyModule {}
