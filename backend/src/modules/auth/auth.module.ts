import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { UserModule } from '../users/user.module';
import { LoginHistory } from './entities/loginHistory.entity';
import { AuthListener } from './listeners/auth.listener';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>('ACCESS_TOKEN_EXPIRATION') as any) || ('1h' as any)
        }
      }),
      inject: [ConfigService]
    }),
    TypeOrmModule.forFeature([LoginHistory]),
    HttpModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, AuthListener],
  exports: [AuthService, JwtAuthGuard]
})
export class AuthModule {}
