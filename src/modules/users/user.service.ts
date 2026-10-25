import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException } from 'src/common/exceptions/badRequest.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { GetUsersDto } from './dto/getUsers.dto';
import { UserStatus, IUser } from './interfaces/user.interface';
import { IResponseData } from 'src/base/baseController';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<IResponseData> {
    // Check if email already exists
    const existingUser = await this.userRepo.findOne({
      where: { email: createUserDto.email, isDeleted: false }
    });

    if (existingUser) {
      throw new BadRequestException({ message: ERROR_MESSAGES.user.EMAIL_ALREADY_EXISTS });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const user = this.userRepo.create({
      ...createUserDto,
      password: hashedPassword,
      status: createUserDto.status || UserStatus.INACTIVE
    });

    const savedUser = await this.userRepo.save(user);

    // Remove password from response
    const { password, ...userWithoutPassword } = savedUser;

    return {
      message: ERROR_MESSAGES.user.USER_CREATED_SUCCESSFULLY,
      data: userWithoutPassword
    };
  }

  async getUsers(getUsersDto: GetUsersDto): Promise<IResponseData> {
    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'DESC' } = getUsersDto;
    const skip = (page - 1) * limit;

    const whereConditions: FindOptionsWhere<User> = { isDeleted: false };

    if (search) {
      whereConditions.firstName = Like(`%${search}%`);
      whereConditions.lastName = Like(`%${search}%`);
    }

    if (status) {
      whereConditions.status = status;
    }

    const [users, total] = await this.userRepo.findAndCount({
      where: whereConditions,
      skip,
      take: limit,
      order: { [sortBy]: sortOrder }
    });

    // Remove passwords from response
    const usersWithoutPasswords = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      message: ERROR_MESSAGES.user.USERS_RETRIEVED_SUCCESSFULLY,
      data: {
        users: usersWithoutPasswords,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  }

  async getUserById(id: number): Promise<IResponseData> {
    const user = await this.userRepo.findOne({
      where: { id, isDeleted: false }
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.user.USER_NOT_FOUND);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      message: ERROR_MESSAGES.user.USER_RETRIEVED_SUCCESSFULLY,
      data: userWithoutPassword
    };
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<IResponseData> {
    const user = await this.userRepo.findOne({
      where: { id, isDeleted: false }
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.user.USER_NOT_FOUND);
    }

    // Check if email already exists (if email is being updated)
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepo.findOne({
        where: { email: updateUserDto.email, isDeleted: false }
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
    await this.userRepo.update({ id }, updateUserDto);

    // Get updated user
    const updatedUser = await this.userRepo.findOne({
      where: { id }
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    return {
      message: ERROR_MESSAGES.user.USER_UPDATED_SUCCESSFULLY,
      data: userWithoutPassword
    };
  }

  async deleteUser(id: number): Promise<IResponseData> {
    const user = await this.userRepo.findOne({
      where: { id, isDeleted: false }
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.user.USER_NOT_FOUND);
    }

    // Soft delete
    await this.userRepo.update({ id }, { isDeleted: true, deletedAt: new Date() });

    return {
      message: ERROR_MESSAGES.user.USER_DELETED_SUCCESSFULLY,
      data: null
    };
  }

  async changeUserStatus(id: number, status: UserStatus): Promise<IResponseData> {
    const user = await this.userRepo.findOne({
      where: { id, isDeleted: false }
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.user.USER_NOT_FOUND);
    }

    await this.userRepo.update({ id }, { status });

    return {
      message: ERROR_MESSAGES.user.USER_STATUS_UPDATED_SUCCESSFULLY,
      data: { status }
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepo.findOne({
      where: { email, isDeleted: false }
    });
  }

  async getUserByEmailForAuth(email: string): Promise<User | null> {
    return await this.userRepo.findOne({
      where: { email, isDeleted: false },
      select: ['id', 'firstName', 'lastName', 'email', 'password', 'status', 'role', 'isDeleted', 'createdAt', 'updatedAt']
    });
  }

  async getUserByIdForAuth(id: number): Promise<User | null> {
    return await this.userRepo.findOne({
      where: { id, isDeleted: false },
      select: ['id', 'firstName', 'lastName', 'email', 'password', 'status', 'role', 'isDeleted', 'createdAt', 'updatedAt']
    });
  }

  /**
   * Set a new password (hashed with bcrypt). Used by the password reset flow.
   */
  async updatePassword(id: number, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update({ id }, { password: hashedPassword });
  }
}
