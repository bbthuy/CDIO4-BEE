import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MedicalRecordController } from './medical-record.controller';
import { MedicalRecordService } from './medical-record.service';

// Import các Entity mà Service cần dùng
import { MedicalRecord } from './entities/medical-record.entity';
import { Booking } from '../booking/entities/booking.entity';
import { Doctor } from '../doctors/entities/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord, Booking, Doctor])],
  controllers: [MedicalRecordController],
  providers: [MedicalRecordService],
  exports: [MedicalRecordService]
})
export class MedicalRecordModule {}
