import { Module, forwardRef } from '@nestjs/common'; // 👈 Nhớ import forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { SepayController } from './sepay.controller';
import { SepayService } from './sepay.service';
import { BookingModule } from '../booking/booking.module'; // Import BookingModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    HttpModule.register({
      timeout: 100000,
      maxRedirects: 5
    }),
    ConfigModule,
    forwardRef(() => BookingModule)
  ],
  controllers: [SepayController],
  providers: [SepayService],
  exports: [SepayService]
})
export class SepayModule {}
