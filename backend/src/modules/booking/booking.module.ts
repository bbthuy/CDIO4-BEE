import { Module, forwardRef } from '@nestjs/common'; // 👈 Nhớ import forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { AppointmentSchedule } from '../schedule/entities/schedule.entity';
import { MailModule } from 'src/common/mail/mail.module';
import { SepayModule } from '../sepay/sepay.module'; // Import SepayModule

@Module({
  imports: [TypeOrmModule.forFeature([Booking, AppointmentSchedule]), MailModule, forwardRef(() => SepayModule)],
  controllers: [BookingController],
  providers: [BookingService],

  exports: [BookingService]
})
export class BookingModule {}
