import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { Doctor } from './entities/doctor.entity';
import { User } from '../users/entities/user.entity';
import { MailModule } from 'src/common/mail/mail.module';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
import { Specialty } from '../specialty/entities/specialty.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, User, Specialty]), MailModule, CloudinaryModule],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService]
})
export class DoctorsModule {}
