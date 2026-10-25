import { HttpException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { BadRequestException } from 'src/common/exceptions/badRequest.exception';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UserService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { LogoutDto } from './dto/logout.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailDto } from './dto/email.dto';
import { VerifyCodeDto } from './dto/verifyCode.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { IJwtPayload, IAuthResponse, IOtpTokenPayload, OtpTokenType } from './interfaces/auth.interface';
import { VerificationCode, VerificationPurpose } from './entities/verificationCode.entity';
import { IResponseData } from 'src/base/baseController';
import { UserStatus, UserRole } from '../users/interfaces/user.interface';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';
import { MailService } from 'src/common/modules/mail/mail.service';

type MailTemplate = 'verify-email' | 'resend-verification-code' | 'send-reset-password-code';
type ErrorMessage = { message: string; status: number; code: string };
type CodeRecipient = { id: number; email: string; firstName: string; lastName: string };

const MAX_CODE_ATTEMPTS = 5;
const CODE_RESEND_COOLDOWN_MS = 60 * 1000; // same as the 60s timer in the FE
const RESET_CONFIRM_TTL_SECONDS = 10 * 60;

const MAIL_SUBJECTS: Record<MailTemplate, string> = {
  'verify-email': 'Clinic Care - Mã kích hoạt tài khoản',
  'resend-verification-code': 'Clinic Care - Mã kích hoạt mới',
  'send-reset-password-code': 'Clinic Care - Mã đặt lại mật khẩu'
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private refreshTokens: Set<string> = new Set();

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    @InjectRepository(VerificationCode) private codeRepo: Repository<VerificationCode>
  ) {}

  // ---------------------------------------------------------------------------
  // Register / login
  // ---------------------------------------------------------------------------

  async register(registerDto: RegisterDto): Promise<IResponseData> {
    // confirmPassword is optional (the FE does not send it); when it is sent it must match
    if (registerDto.confirmPassword !== undefined && registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException({ message: ERROR_MESSAGES.auth.PASSWORD_MISMATCH });
    }

    // Check if email already exists
    const existingUser = await this.userService.getUserByEmailForAuth(registerDto.email);
    if (existingUser) {
      throw new BadRequestException({ message: ERROR_MESSAGES.auth.EMAIL_ALREADY_EXISTS });
    }

    // The account stays INACTIVE until the email code is verified
    const createUserDto: CreateUserDto = {
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: registerDto.password,
      status: UserStatus.INACTIVE
    };

    const userResponse = await this.userService.createUser(createUserDto);

    if (!userResponse.data) {
      throw new BadRequestException({ message: ERROR_MESSAGES.auth.REGISTRATION_FAILED });
    }

    const user = userResponse.data;
    const verificationToken = await this.issueCode(user, VerificationPurpose.SIGNUP, 'verify-email', 'verification');

    return {
      message: ERROR_MESSAGES.common.CREATED,
      data: {
        verificationToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
          role: user.role
        }
      }
    };
  }

  async login(loginDto: LoginDto): Promise<IResponseData> {
    const user = await this.userService.getUserByEmailForAuth(loginDto.email);

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.auth.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_MESSAGES.auth.INVALID_CREDENTIALS);
    }

    // Correct password but email not verified yet: send a new code, the FE then shows the OTP screen
    if (user.status === UserStatus.INACTIVE) {
      const verificationToken = await this.issueCode(user, VerificationPurpose.SIGNUP, 'resend-verification-code', 'verification');
      return {
        message: ERROR_MESSAGES.auth.VERIFICATION_CODE_SENT,
        data: { verificationToken }
      };
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(ERROR_MESSAGES.auth.USER_NOT_ACTIVE);
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Store refresh token
    this.refreshTokens.add(tokens.refreshToken);

    const authResponse: IAuthResponse = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        role: user.role
      }
    };

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: authResponse
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<IResponseData> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET')
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException(ERROR_MESSAGES.auth.INVALID_TOKEN_TYPE);
      }

      if (!this.refreshTokens.has(refreshTokenDto.refreshToken)) {
        throw new UnauthorizedException(ERROR_MESSAGES.auth.TOKEN_REVOKED);
      }

      const user = await this.userService.getUserById(payload.id);
      if (!user || user.data.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException(ERROR_MESSAGES.auth.USER_NOT_ACTIVE);
      }

      // Remove old refresh token
      this.refreshTokens.delete(refreshTokenDto.refreshToken);

      // Generate new tokens (role is read from the database, so role changes apply on refresh)
      const tokens = await this.generateTokens(payload.id, payload.email, user.data.role);

      // Store new refresh token
      this.refreshTokens.add(tokens.refreshToken);

      const authResponse: IAuthResponse = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.data.id,
          email: user.data.email,
          firstName: user.data.firstName,
          lastName: user.data.lastName,
          status: user.data.status,
          role: user.data.role
        }
      };

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: authResponse
      };
    } catch (error) {
      throw new UnauthorizedException(ERROR_MESSAGES.auth.INVALID_REFRESH_TOKEN);
    }
  }

  async logout(logoutDto: LogoutDto): Promise<IResponseData> {
    if (this.refreshTokens.has(logoutDto.refreshToken)) {
      this.refreshTokens.delete(logoutDto.refreshToken);
    }

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: null
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET')
      });

      if (payload.type !== 'access') {
        throw new UnauthorizedException(ERROR_MESSAGES.auth.INVALID_TOKEN_TYPE);
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException(ERROR_MESSAGES.auth.INVALID_TOKEN);
    }
  }

  // ---------------------------------------------------------------------------
  // Account activation (email code)
  // ---------------------------------------------------------------------------

  /** POST /auth/verification-codes - send a new activation code */
  async resendVerificationCode(emailDto: EmailDto): Promise<IResponseData> {
    const user = await this.userService.getUserByEmailForAuth(emailDto.email);

    // Same response shape whether or not the email exists, so the endpoint cannot be used to probe accounts
    const verificationToken =
      user && user.status === UserStatus.INACTIVE
        ? await this.issueCode(user, VerificationPurpose.SIGNUP, 'resend-verification-code', 'verification')
        : await this.decoyToken('verification');

    return {
      message: ERROR_MESSAGES.auth.VERIFICATION_CODE_SENT,
      data: { verificationToken }
    };
  }

  /** POST /auth/verification-codes/verify - check the code and activate the account */
  async verifyVerificationCode(verifyCodeDto: VerifyCodeDto): Promise<IResponseData> {
    const userId = await this.consumeCode(verifyCodeDto.token, verifyCodeDto.code, VerificationPurpose.SIGNUP, 'verification');

    const user = await this.userService.getUserByIdForAuth(userId);
    if (!user || user.status !== UserStatus.INACTIVE) {
      this.fail(ERROR_MESSAGES.auth.INVALID_VERIFICATION_CODE);
    }

    await this.userService.changeUserStatus(user.id, UserStatus.ACTIVE);

    return {
      message: ERROR_MESSAGES.auth.VALID_VERIFICATION_CODE,
      data: null
    };
  }

  // ---------------------------------------------------------------------------
  // Forgot password
  // ---------------------------------------------------------------------------

  /** POST /auth/password-resets - send a reset code */
  async requestPasswordReset(emailDto: EmailDto): Promise<IResponseData> {
    const user = await this.userService.getUserByEmailForAuth(emailDto.email);

    const token =
      user && user.status === UserStatus.ACTIVE
        ? await this.issueCode(user, VerificationPurpose.RESET_PASSWORD, 'send-reset-password-code', 'password-reset')
        : await this.decoyToken('password-reset');

    return {
      message: ERROR_MESSAGES.auth.VERIFICATION_CODE_SENT,
      data: { token }
    };
  }

  /** POST /auth/password-resets/verify - check the code, return a token allowed to set a new password */
  async verifyPasswordResetCode(verifyCodeDto: VerifyCodeDto): Promise<IResponseData> {
    const userId = await this.consumeCode(verifyCodeDto.token, verifyCodeDto.code, VerificationPurpose.RESET_PASSWORD, 'password-reset');

    const user = await this.userService.getUserByIdForAuth(userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      this.fail(ERROR_MESSAGES.auth.INVALID_VERIFICATION_CODE);
    }

    const payload: IOtpTokenPayload = {
      type: 'password-reset-confirmed',
      uid: user.id,
      ph: this.passwordFingerprint(user.password)
    };
    const token = await this.signOtpToken(payload, RESET_CONFIRM_TTL_SECONDS);

    return {
      message: ERROR_MESSAGES.auth.VALID_VERIFICATION_CODE,
      data: { token }
    };
  }

  /** PUT /auth/password - set the new password */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<IResponseData> {
    let payload: IOtpTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync(resetPasswordDto.token, { secret: this.otpSecret() });
    } catch (error) {
      this.fail(ERROR_MESSAGES.auth.INVALID_RESET_TOKEN);
    }

    if (payload.type !== 'password-reset-confirmed') {
      this.fail(ERROR_MESSAGES.auth.INVALID_RESET_TOKEN);
    }

    const user = await this.userService.getUserByIdForAuth(payload.uid);
    // The fingerprint changes as soon as the password changes, so a reset token can only be used once
    if (!user || user.status !== UserStatus.ACTIVE || payload.ph !== this.passwordFingerprint(user.password)) {
      this.fail(ERROR_MESSAGES.auth.INVALID_RESET_TOKEN);
    }

    await this.userService.updatePassword(user.id, resetPasswordDto.newPassword);

    return {
      message: ERROR_MESSAGES.auth.PASSWORD_RESET_SUCCESSFUL,
      data: null
    };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private fail(error: ErrorMessage): never {
    throw new HttpException(error, error.status);
  }

  private otpSecret(): string {
    return this.configService.get<string>('VERIFICATION_TOKEN_SECRET') || this.configService.get<string>('ACCESS_TOKEN_SECRET');
  }

  private codeTtlMinutes(): number {
    return Number(this.configService.get<string>('VERIFICATION_CODE_TTL_MINUTES')) || 15;
  }

  private generateCode(): string {
    return crypto.randomInt(0, 1000000).toString().padStart(6, '0');
  }

  private hashCode(codeId: string, code: string): string {
    return crypto.createHmac('sha256', this.otpSecret()).update(`${codeId}:${code}`).digest('hex');
  }

  private passwordFingerprint(passwordHash: string): string {
    return crypto.createHash('sha256').update(passwordHash).digest('hex').slice(0, 32);
  }

  private signOtpToken(payload: IOtpTokenPayload, expiresInSeconds: number): Promise<string> {
    return this.jwtService.signAsync({ ...payload }, { secret: this.otpSecret(), expiresIn: expiresInSeconds });
  }

  /** A token that looks real but can never be verified - returned for unknown emails */
  private decoyToken(type: OtpTokenType): Promise<string> {
    return this.signOtpToken({ type, uid: 0, cid: crypto.randomUUID() }, this.codeTtlMinutes() * 60);
  }

  /**
   * Create a code for the user, e-mail it and return the token the FE must send back with the code.
   * Calling it again within 60s does not send another e-mail (protects the mailbox from spam).
   */
  private async issueCode(user: CodeRecipient, purpose: VerificationPurpose, template: MailTemplate, tokenType: OtpTokenType): Promise<string> {
    const ttlMinutes = this.codeTtlMinutes();
    const now = Date.now();

    const latest = await this.codeRepo.findOne({ where: { userId: user.id, purpose }, order: { createdAt: 'DESC' } });
    if (latest && latest.expiresAt.getTime() > now && now - latest.createdAt.getTime() < CODE_RESEND_COOLDOWN_MS) {
      return this.signOtpToken({ type: tokenType, uid: user.id, cid: latest.id }, ttlMinutes * 60);
    }

    // Only one live code per user and purpose
    await this.codeRepo.delete({ userId: user.id, purpose });

    const id = crypto.randomUUID();
    const code = this.generateCode();
    await this.codeRepo.save(
      this.codeRepo.create({
        id,
        userId: user.id,
        purpose,
        codeHash: this.hashCode(id, code),
        expiresAt: new Date(now + ttlMinutes * 60 * 1000),
        attempts: 0,
        createdAt: new Date(now)
      })
    );

    await this.sendCodeEmail(user, code, template, ttlMinutes);

    return this.signOtpToken({ type: tokenType, uid: user.id, cid: id }, ttlMinutes * 60);
  }

  private async sendCodeEmail(user: CodeRecipient, code: string, template: MailTemplate, ttlMinutes: number): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER');

    try {
      await this.mailService.sendEmail(MAIL_SUBJECTS[template], from, user.email, {
        template,
        context: { name: `${user.lastName} ${user.firstName}`.trim(), code, expiresInMinutes: ttlMinutes }
      });
    } catch (error) {
      // The user is already saved: do not fail the request, they can ask for a new code
      this.logger.error(`Could not send "${template}" e-mail to ${user.email}: ${error?.message}`);
    }

    // Local development without SMTP: read the code from the console
    if (process.env.NODE_ENV !== 'production') {
      this.logger.warn(`[DEV ONLY] ${template} code for ${user.email}: ${code}`);
    }
  }

  /**
   * Validate token + code. Wrong codes are counted (max 5 per code), a correct code is deleted so it works once.
   * Returns the user id.
   */
  private async consumeCode(token: string, code: string, purpose: VerificationPurpose, tokenType: OtpTokenType): Promise<number> {
    let payload: IOtpTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync(token, { secret: this.otpSecret() });
    } catch (error) {
      this.fail(error?.name === 'TokenExpiredError' ? ERROR_MESSAGES.auth.VERIFICATION_CODE_EXPIRED : ERROR_MESSAGES.auth.INVALID_VERIFICATION_CODE);
    }

    if (payload.type !== tokenType || !payload.cid) {
      this.fail(ERROR_MESSAGES.auth.INVALID_VERIFICATION_CODE);
    }

    const record = await this.codeRepo.findOne({ where: { id: payload.cid, userId: payload.uid, purpose } });
    if (!record) {
      this.fail(ERROR_MESSAGES.auth.INVALID_VERIFICATION_CODE);
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      await this.codeRepo.delete({ id: record.id });
      this.fail(ERROR_MESSAGES.auth.VERIFICATION_CODE_EXPIRED);
    }

    // Count the attempt atomically before comparing, so parallel requests cannot exceed the limit
    const counted = await this.codeRepo
      .createQueryBuilder()
      .update(VerificationCode)
      .set({ attempts: () => 'attempts + 1' })
      .where('id = :id AND attempts < :max', { id: record.id, max: MAX_CODE_ATTEMPTS })
      .execute();

    if (!counted.affected) {
      this.fail(ERROR_MESSAGES.auth.TOO_MANY_ATTEMPTS);
    }

    const expected = Buffer.from(record.codeHash, 'hex');
    const actual = Buffer.from(this.hashCode(record.id, code), 'hex');
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
      this.fail(ERROR_MESSAGES.auth.INVALID_VERIFICATION_CODE);
    }

    await this.codeRepo.delete({ id: record.id });
    return record.userId;
  }

  private async generateTokens(id: number, email: string, role: UserRole) {
    const accessTokenPayload: IJwtPayload = {
      id,
      email,
      role,
      type: 'access'
    };

    const refreshTokenPayload: IJwtPayload = {
      id,
      email,
      role,
      type: 'refresh'
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: (this.configService.get<string>('ACCESS_TOKEN_EXPIRATION') || '1h') as JwtSignOptions['expiresIn']
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: (this.configService.get<string>('REFRESH_TOKEN_EXPIRATION') || '7d') as JwtSignOptions['expiresIn']
      })
    ]);

    return { accessToken, refreshToken };
  }
}
