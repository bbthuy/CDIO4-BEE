import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { BaseController } from 'src/base/baseController';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { GetUsersDto } from './dto/getUsers.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';
import { UserStatus } from './interfaces/user.interface';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';

@Controller('users')
@ApiTags('Users')
export class UserController extends BaseController {
  constructor(private readonly userService: UserService) {
    super();
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createUser(@Res() res: Response, @Body() createUserDto: CreateUserDto): Promise<Response> {
    try {
      const response = await this.userService.createUser(createUserDto);
      return this.responseCreated(res, response);
    } catch (error) {
      console.log(error);
      if (error.status === HttpStatus.BAD_REQUEST) {
        return this.responseBadRequest(res, { message: error.response.message });
      }
      return this.responseInternalServerError(res, { message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(@Res() res: Response, @Query() getUsersDto: GetUsersDto): Promise<Response> {
    try {
      const response = await this.userService.getUsers(getUsersDto);
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      if (error.status === HttpStatus.BAD_REQUEST) {
        return this.responseBadRequest(res, { message: error.response.message });
      }
      return this.responseInternalServerError(res, { message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Res() res: Response, @Param('id') id: number): Promise<Response> {
    try {
      const response = await this.userService.getUserById(id);
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      if (error.status === HttpStatus.NOT_FOUND) {
        return this.responseNotFound(res, { message: error.response.message });
      }
      return this.responseInternalServerError(res, { message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR });
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateUser(@Res() res: Response, @Param('id') id: number, @Body() updateUserDto: UpdateUserDto): Promise<Response> {
    try {
      const response = await this.userService.updateUser(id, updateUserDto);
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      if (error.status === HttpStatus.NOT_FOUND) {
        return this.responseNotFound(res, { message: error.response.message });
      }
      if (error.status === HttpStatus.BAD_REQUEST) {
        return this.responseBadRequest(res, { message: error.response.message });
      }
      return this.responseInternalServerError(res, { message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR });
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user by ID (soft delete)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Res() res: Response, @Param('id') id: number): Promise<Response> {
    try {
      const response = await this.userService.deleteUser(id);
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      if (error.status === HttpStatus.NOT_FOUND) {
        return this.responseNotFound(res, { message: error.response.message });
      }
      return this.responseInternalServerError(res, { message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR });
    }
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Change user status' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changeUserStatus(@Res() res: Response, @Param('id') id: number, @Body('status') status: UserStatus): Promise<Response> {
    try {
      const response = await this.userService.changeUserStatus(id, status);
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      if (error.status === HttpStatus.NOT_FOUND) {
        return this.responseNotFound(res, { message: error.response.message });
      }
      return this.responseInternalServerError(res, { message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR });
    }
  }

  @Get('profile/me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getCurrentUserProfile(@Res() res: Response, @CurrentUser() user: any): Promise<Response> {
    try {
      const response = await this.userService.getUserById(user.id);
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      if (error.status === HttpStatus.NOT_FOUND) {
        return this.responseNotFound(res, { message: error.response.message });
      }
      return this.responseInternalServerError(res, { message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR });
    }
  }
}
