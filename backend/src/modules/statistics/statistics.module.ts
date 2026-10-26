import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

// Import các Entity cần dùng
import { Booking } from '../booking/entities/booking.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Doctor, User])],
  controllers: [StatisticsController],
  providers: [StatisticsService]
})
export class StatisticsModule {}
