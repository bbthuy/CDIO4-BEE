import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { ConfigModule } from './configs/config.module';
import { ConfigService } from './configs/config.service';
import { User } from './modules/users/entities/user.entity';
import { VerificationCode } from './modules/auth/entities/verificationCode.entity';
import { Specialty } from './modules/specialties/entities/specialty.entity';
import { Doctor } from './modules/doctors/entities/doctor.entity';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { SpecialtyModule } from './modules/specialties/specialty.module';
import { UploadModule } from './modules/upload/upload.module';
import { DoctorModule } from './modules/doctors/doctor.module';
import { CustomLogger } from './common/modules/logger/customerLogger.service';
import { LoggerMiddleware } from './common/middlewares/middleware';
import { MailModule } from './common/modules/mail/mail.module';

const databaseConfig = {
  type: 'mysql' as const,
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 3307),
  username: process.env.DATABASE_USER || 'npis',
  password: process.env.DATABASE_PASSWORD || 'npis',
  database: process.env.DATABASE_DATABASE || 'npis_db',
  entities: [User, VerificationCode, Specialty, Doctor],
  logging: true,
  synchronize: true,
};

console.log('Database config:', {
  ...databaseConfig,
  password: '***',
});

@Module({
  imports: [
    ConfigModule,

    ScheduleModule.forRoot(),

    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([]),

    MailModule,
    UserModule,
    AuthModule,
    SpecialtyModule,
    UploadModule,
    DoctorModule,
  ],
  controllers: [AppController],
  providers: [ConfigService, CustomLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes(AppController);
  }
}
