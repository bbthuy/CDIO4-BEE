import { Body, Controller, HttpCode, HttpException, HttpStatus, Post, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { BaseController, IResponseData } from 'src/base/baseController';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { LogoutDto } from './dto/logout.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailDto } from './dto/email.dto';
import { VerifyCodeDto } from './dto/verifyCode.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';
import { Public } from './decorators/public.decorator';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  /**
   * Turn any error into { message, code, status, data: null } with the real HTTP status.
   * (The FE reads `message` as a string.)
   */
  private sendError(res: Response, error: any): Response {
    console.log(error);

    if (error instanceof HttpException) {
      const body: any = error.getResponse();
      const detail = body && typeof body.message === 'object' ? body.message : body;
      const message = typeof detail?.message === 'string' ? detail.message : ERROR_MESSAGES.common.BAD_REQUEST.message;

      return res.status(error.getStatus()).json({
        message,
        code: detail?.code || message,
        status: error.getStatus(),
        data: null
      });
    }

    return this.responseInternalServerError(res, { message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR });
  }

  private async handle(res: Response, action: () => Promise<IResponseData>, created = false): Promise<Response> {
    try {
      const response = await action();
      return created ? this.responseCreated(res, response) : this.responseSuccess(res, response);
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account (a 6-digit activation code is sent by email)' })
  @ApiResponse({ status: 201, description: 'Account created, data.verificationToken is returned' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or email already exists' })
  async register(@Res() res: Response, @Body() registerDto: RegisterDto): Promise<Response> {
    return this.handle(res, () => this.authService.register(registerDto), true);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login (inactive account: a new activation code is sent and data.verificationToken is returned)' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Res() res: Response, @Body() loginDto: LoginDto): Promise<Response> {
    return this.handle(res, () => this.authService.login(loginDto));
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Res() res: Response, @Body() refreshTokenDto: RefreshTokenDto): Promise<Response> {
    return this.handle(res, () => this.authService.refreshToken(refreshTokenDto));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Res() res: Response, @Body() logoutDto: LogoutDto): Promise<Response> {
    return this.handle(res, () => this.authService.logout(logoutDto));
  }

  // --- Account activation -------------------------------------------------

  @Post('verification-codes')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a new activation code' })
  @ApiResponse({ status: 200, description: 'data.verificationToken is returned' })
  async resendVerificationCode(@Res() res: Response, @Body() emailDto: EmailDto): Promise<Response> {
    return this.handle(res, () => this.authService.resendVerificationCode(emailDto));
  }

  @Post('verification-codes/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify the activation code and activate the account' })
  @ApiResponse({ status: 200, description: 'Account activated' })
  @ApiResponse({ status: 401, description: 'Invalid code' })
  async verifyVerificationCode(@Res() res: Response, @Body() verifyCodeDto: VerifyCodeDto): Promise<Response> {
    return this.handle(res, () => this.authService.verifyVerificationCode(verifyCodeDto));
  }

  // --- Forgot password ----------------------------------------------------

  @Post('password-resets')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forgot password: send a reset code by email' })
  @ApiResponse({ status: 200, description: 'data.token is returned' })
  async requestPasswordReset(@Res() res: Response, @Body() emailDto: EmailDto): Promise<Response> {
    return this.handle(res, () => this.authService.requestPasswordReset(emailDto));
  }

  @Post('password-resets/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify the reset code, returns a token to set the new password' })
  @ApiResponse({ status: 200, description: 'data.token is returned' })
  @ApiResponse({ status: 401, description: 'Invalid code' })
  async verifyPasswordResetCode(@Res() res: Response, @Body() verifyCodeDto: VerifyCodeDto): Promise<Response> {
    return this.handle(res, () => this.authService.verifyPasswordResetCode(verifyCodeDto));
  }

  @Put('password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a new password with the token from /password-resets/verify' })
  @ApiResponse({ status: 200, description: 'Password updated' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Res() res: Response, @Body() resetPasswordDto: ResetPasswordDto): Promise<Response> {
    return this.handle(res, () => this.authService.resetPassword(resetPasswordDto));
  }
}
