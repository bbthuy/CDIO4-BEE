import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { LoginHistory } from 'src/modules/auth/entities/loginHistory.entity';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { UserModule } from 'src/modules/users/user.module';
import { Specialty } from 'src/modules/specialty/entities/specialty.entity';
import { Doctor } from 'src/modules/doctors/entities/doctor.entity';
import { Review } from 'src/modules/reviews/entities/reviews.entities';
import { Notification } from 'src/modules/notification/entities/notification.entity';
import { AppointmentSchedule } from 'src/modules/schedule/entities/schedule.entity';
import { Booking } from 'src/modules/booking/entities/booking.entity';
import { Payment } from 'src/modules/sepay/entities/payment.entity';
import { ApprovedContent } from 'src/modules/gemini/entities/approved_content.entity';
import { PendingContent } from 'src/modules/gemini/entities/pending-content.entity';
import { RejectedContent } from 'src/modules/gemini/entities/rejected-content.entity';
import { MedicalRecord } from 'src/modules/medical/entities/medical-record.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, UserModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DATABASE_HOST') || 'localhost',
        port: configService.get('DATABASE_PORT') || 3306,
        username: configService.get('DATABASE_USER') || 'root',
        password: configService.get('DATABASE_PASSWORD') || 'root',
        database: process.env.DATABASE_DATABASE || 'test',
        entities: [
          User,
          LoginHistory,
          Specialty,
          Doctor,
          Review,
          Notification,
          Specialty,
          Booking,
          AppointmentSchedule,
          Payment,
          ApprovedContent,
          PendingContent,
          RejectedContent,
          MedicalRecord
        ],
        logging: true,
        timezone: 'Z',
        synchronize: true
      }),
      inject: [ConfigService],
      dataSourceFactory: async (options) => {
        const dataSource = new DataSource(options);
        await dataSource.initialize();
        addTransactionalDataSource(dataSource);
        return dataSource;
      }
    })
  ],
  exports: [TypeOrmModule]
})
export class DatabaseModule {}
