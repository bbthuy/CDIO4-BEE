import { Injectable } from '@nestjs/common';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException } from 'src/common/exceptions/badRequest.exception';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { GetUsersDto } from './dto/getUsers.dto';
import { IResponseData } from 'src/base/baseController';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';
import { UserStatus } from './interfaces/user.interface';
import { BaseService } from 'src/base/baseService';
import { NotFoundException } from 'src/common/exceptions/notFound.exception';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Notification } from '../notification/entities/notification.entity';
import { Review } from '../reviews/entities/reviews.entities';
import { Booking } from '../booking/entities/booking.entity';
import { AppointmentSchedule } from '../schedule/entities/schedule.entity';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,

    @InjectRepository(Review)
    private readonly reviewsRepo: Repository<Review>,

    @InjectRepository(Booking)
    private readonly bookingsRepo: Repository<Booking>,

    @InjectRepository(AppointmentSchedule)
    private readonly schedulesRepo: Repository<AppointmentSchedule>
  ) {
    super(userRepo);
  }

  async createAndGetAuthUser(createUserDto: CreateUserDto): Promise<IResponseData> {
    const user = await this.createUser(createUserDto, ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt']);
    return {
      message: ERROR_MESSAGES.user.USER_CREATED_SUCCESSFULLY,
      data: user
    };
  }

  async getAuthUsers(getUsersDto: GetUsersDto): Promise<IResponseData> {
    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'DESC' } = getUsersDto;
    const skip = (page - 1) * limit;

    const whereConditions: FindOptionsWhere<User> = {};

    if (search) {
      whereConditions.firstName = Like(`%${search}%`);
      whereConditions.lastName = Like(`%${search}%`);
    }

    if (status) {
      whereConditions.status = status;
    }

    const [users, total] = await this.findAndCount({
      where: whereConditions,
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt'],
      skip,
      take: limit,
      order: { [sortBy]: sortOrder }
    });

    return {
      message: ERROR_MESSAGES.user.USERS_RETRIEVED_SUCCESSFULLY,
      data: {
        users: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  }

  async getAuthUser(id: number): Promise<IResponseData> {
    const user = await this.findOneById(id, {
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt']
    });

    if (!user) {
      throw new NotFoundException({ message: ERROR_MESSAGES.user.USER_NOT_FOUND });
    }

    return {
      message: ERROR_MESSAGES.user.USER_RETRIEVED_SUCCESSFULLY,
      data: user
    };
  }

  async updateAndGetAuthUser(id: number, updateUserDto: UpdateUserDto): Promise<IResponseData> {
    const updatedUser = await this.updateAndFindOneById(id, updateUserDto, {
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt']
    });

    return {
      message: ERROR_MESSAGES.user.USER_UPDATED_SUCCESSFULLY,
      data: updatedUser
    };
  }

  async deleteUser(id: number): Promise<IResponseData> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException({ message: ERROR_MESSAGES.user.USER_NOT_FOUND });
    }

    // Nếu user là bác sĩ → xoá toàn bộ dữ liệu liên quan đến doctor
    const doctor = await this.doctorRepo.findOne({ where: { userId: id } });

    if (doctor) {
      // ---- 1. Xoá BOOKINGS → vì có FK đến schedule ----
      const schedules = await this.schedulesRepo.find({ where: { doctorId: doctor.id } });

      for (const schedule of schedules) {
        await this.bookingsRepo.delete({ scheduleId: schedule.id });
      }

      // ---- 2. Xoá SCHEDULE ----
      await this.schedulesRepo.delete({ doctorId: doctor.id });

      // ---- 3. Xoá NOTIFICATION ----
      await this.notificationsRepo.delete({ receiverId: id }); // receiver = userId

      // ---- 4. Xoá REVIEW ----
      await this.reviewsRepo.delete({ doctorId: doctor.id });

      // ---- 5. Xoá Doctor (soft delete) ----
      await this.doctorRepo.delete(doctor.id);
    }

    // ---- 6. Xoá USER (soft delete) ----
    await this.userRepo.delete(id);

    return {
      message: ERROR_MESSAGES.user.USER_DELETED_SUCCESSFULLY,
      data: null
    };
  }

  async createUser(createUserDto: CreateUserDto, optFields?: (keyof User)[]): Promise<User> {
    // Check if email already exists
    const existingUser = await this.findOne({
      where: { email: createUserDto.email }
    });
    if (existingUser) {
      throw new BadRequestException({ message: ERROR_MESSAGES.user.EMAIL_ALREADY_EXISTS });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const user = await this.create({
      ...createUserDto,
      password: hashedPassword,
      status: createUserDto.status || UserStatus.INACTIVE
    });

    const newUser = await this.findOneById(user.id, { select: optFields });

    return newUser;
  }

  async updateUserById(id: number, updateUserDto: UpdateUserDto, optsField?: (keyof User)[]): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException({ message: ERROR_MESSAGES.user.USER_NOT_FOUND });
    }

    // Check if email already exists (if email is being updated)
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findOne({
        where: { email: updateUserDto.email }
      });

      if (existingUser) {
        throw new BadRequestException({ message: ERROR_MESSAGES.user.EMAIL_ALREADY_EXISTS });
      }
    }

    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    await this.updateById(id, updateUserDto);

    const updatedUser = await this.findOneById(id, {
      select: optsField
    });

    return updatedUser;
  }
}
