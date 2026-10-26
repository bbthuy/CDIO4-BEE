import { Body, Controller, Post, Res, HttpCode, HttpStatus, Get, Put, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { BaseController } from 'src/base/baseController';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { ResendCodeDto } from './dto/resendCode.dto';
import { VerifyCodeDto } from './dto/verifyCode.dto';
import { ClientIp } from 'src/common/decorators/clientIp.decorator';
import { RequestResetPasswordDto } from './dto/requestResetPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { CurrentUser } from './decorators/currentUser.decorator';
import { SocialLoginDto } from './dto/socialLogin.dto';
import { IUserRequest } from 'src/types/express';
import { PermissionGuard } from '../common/guards/permission.guard';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { RequirePermission } from '../common/decorators/requirePermission.decorator';
import { PERMISSIONS } from '../common/constants/permission.constant';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }
  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Account registered successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error or email already exists' })
  async register(@Res() res: Response, @Body() registerDto: RegisterDto): Promise<Response> {
    try {
      const response = await this.authService.register(registerDto);
      return this.responseCreated(res, response);
    } catch (error) {
      console.log(error);
      return this.responseError(res, error, { message: error.response.message });
    }
  }

  @Post('verification-codes')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a verification code' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Verification code sent successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Validation error or email not found' })
  async resendVerificationCode(@Res() res: Response, @Body() resendCodeDto: ResendCodeDto): Promise<Response> {
    try {
      const response = await this.authService.resendVerificationCode(resendCodeDto);
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      return this.responseError(res, error, { message: error.response.message });
    }
  }

  @Post('verification-codes/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a verification code' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Verification code verified successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid verification code' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async verifyVerificationCode(@Res() res: Response, @Body() verifyCodeDto: VerifyCodeDto): Promise<Response> {
    try {
      const response = await this.authService.verifyVerificationCode(verifyCodeDto);
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      return this.responseError(res, error, { message: error.response.message });
    }
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Invalid password' })
  @ApiResponse({ status: HttpStatus.LOCKED, description: 'Account is locked due to too many failed login attempts' })
  async login(@Res() res: Response, @Body() loginDto: LoginDto, @ClientIp() ipAddress: string): Promise<Response> {
    try {
      const response = await this.authService.login(loginDto, ipAddress);
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      return this.responseError(res, error, {
        message: error.response.message,
        data: error.response.data
      });
    }
  }

  @Post('refresh-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Token refreshed successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid refresh token' })
  async refreshToken(@Res() res: Response, @Body() refreshTokenDto: RefreshTokenDto): Promise<Response> {
    try {
      const response = await this.authService.refreshToken(refreshTokenDto);
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      return this.responseError(res, error, { message: error.response.message });
    }
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logout successful' })
  async logout(@Res() res: Response, @CurrentUser() user: IUserRequest): Promise<Response> {
    try {
      const response = await this.authService.logout(user.id);
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      return this.responseError(res, error, { message: error.response.message });
    }
  }

  @Post('password-resets')
  @Public()
  @ApiOperation({ summary: 'Request password reset via email' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reset code sent successfully' })
  async requestReset(@Res() res: Response, @Body() dto: RequestResetPasswordDto) {
    try {
      const response = await this.authService.requestResetPassword(dto);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, { message: error.response.message });
    }
  }

  @Post('password-resets/verify')
  @Public()
  @ApiOperation({ summary: 'Verify reset password code' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reset code verified successfully' })
  async verifyReset(@Res() res: Response, @Body() dto: VerifyCodeDto) {
    try {
      const response = await this.authService.verifyResetCode(dto);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, { message: error.response.message });
    }
  }

  @Put('password')
  @Public()
  @ApiOperation({ summary: 'Reset password with verification code' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password reset successfully' })
  async resetPassword(@Res() res: Response, @Body() dto: ResetPasswordDto) {
    try {
      const response = await this.authService.resetPassword(dto);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error, { message: error.response.message });
    }
  }

  @Post('social-login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Social login' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Social login successful' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' })
  async socialLogin(@Res() res: Response, @ClientIp() ipAddress: string, @Body() socialLoginDto: SocialLoginDto): Promise<Response> {
    try {
      const response = await this.authService.socialLogin(socialLoginDto, ipAddress);
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      return this.responseError(res, error, { message: error.response.message });
    }
  }
}
