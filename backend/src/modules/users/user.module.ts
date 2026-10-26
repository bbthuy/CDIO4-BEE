import { UserService } from './user.service';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UserController } from './user.controller';
import { LoggerMiddleware } from 'src/common/middlewares/middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { AppointmentSchedule } from '../schedule/entities/schedule.entity';
import { Review } from '../reviews/entities/reviews.entities';
import { Booking } from '../booking/entities/booking.entity';
import { Notification } from '../notification/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Doctor, Notification, Review, Booking, AppointmentSchedule])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(UserController);
  }
}
