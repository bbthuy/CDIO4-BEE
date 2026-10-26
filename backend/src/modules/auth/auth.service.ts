import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { BadRequestException } from 'src/common/exceptions/badRequest.exception';
import { NotFoundException } from 'src/common/exceptions/notFound.exception';
import { UnauthorizedException } from 'src/common/exceptions/unauthorized.exception';
import { LockedException } from 'src/common/exceptions/locked.exception';
import { UserService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { RegisterDto } from './dto/register.dto';
import { ILoginResponse, IRegisterResponse } from './interfaces/authResponse.interface';
import { IResponseData } from 'src/base/baseController';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';
import { IAccountVerifyPayload, IJwtPayload, IPasswordResetPayload, JwtType } from './interfaces/jwtPayload.interface';
import { randomNumericCode, randomString } from 'src/common/utils/randomString';
import { ResendCodeDto } from './dto/resendCode.dto';
import { VerifyCodeDto } from './dto/verifyCode.dto';
import { UserRole, UserStatus } from '../users/interfaces/user.interface';
import { User } from '../users/entities/user.entity';
import { LoginHistory } from './entities/loginHistory.entity';
import { BaseService } from 'src/base/baseService';
import { RequestResetPasswordDto } from './dto/requestResetPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { SocialLoginDto } from './dto/socialLogin.dto';
import { LoginMethod, LoginStatus } from './interfaces/loginHistory.interface';
import { LOGIN_FAILURE_RULES, MAX_FAILED_LOGIN_ATTEMPT } from './constants/login.constant';
import { LoginEvent } from 'src/common/modules/events/events/auth.event';
import { MAIL_FROM, TEMPLATE_MAIL } from 'src/common/mail/templates';
import { MailService } from 'src/common/mail/mail.service';

@Injectable()
export class AuthService extends BaseService<LoginHistory> {
  constructor(
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepo: Repository<LoginHistory>,

    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    private readonly mailService: MailService,
    private readonly eventEmitter: EventEmitter2,
    private readonly httpService: HttpService
  ) {
    super(loginHistoryRepo);
  }

  async register(registerDto: RegisterDto): Promise<IResponseData> {
    // Check if email already exists
    const existingUser = await this.userService.findOne({
      where: { email: registerDto.email },
      select: ['id']
    });
    if (existingUser) {
      throw new BadRequestException({ message: ERROR_MESSAGES.auth.EMAIL_ALREADY_EXISTS });
    }

    // Create user DTO
    const createUserDto: CreateUserDto = {
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: registerDto.password,
      status: UserStatus.INACTIVE,
      isActive: false,
      role: UserRole.USER
    };

    // Create user
    const authUser = await this.userService.createUser(createUserDto, ['id', 'email', 'firstName', 'lastName', 'status', 'createdAt']);

    // Generate verification token and send verification email
    const verificationToken = await this.sendVerifyEmail(authUser.id, authUser.email, TEMPLATE_MAIL.VERIFY_EMAIL.subject, TEMPLATE_MAIL.VERIFY_EMAIL.name);

    const authResponse: IRegisterResponse = {
      verificationToken: verificationToken,
      user: authUser
    };

    return {
      message: ERROR_MESSAGES.common.CREATED,
      data: authResponse
    };
  }

  async resendVerificationCode(resendCodeDto: ResendCodeDto): Promise<IResponseData> {
    const user = await this.userService.findOne({
      where: { email: resendCodeDto.email },
      select: ['id', 'email']
    });
    if (!user) {
      throw new NotFoundException({ message: ERROR_MESSAGES.auth.EMAIL_NOT_FOUND });
    }

    const verificationToken = await this.sendVerifyEmail(
      user.id,
      user.email,
      TEMPLATE_MAIL.RESEND_VERIFICATION_CODE.subject,
      TEMPLATE_MAIL.RESEND_VERIFICATION_CODE.name
    );

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: { verificationToken }
    };
  }

  async verifyVerificationCode(verifyCodeDto: VerifyCodeDto): Promise<IResponseData> {
    // Validate the token
    const secret = this.configService.get<string>('ACCOUNT_VERIFICATION_TOKEN_SECRET');
    const payload: IAccountVerifyPayload = await this.verifyToken(verifyCodeDto.token, secret, JwtType.VERIFY_ACCOUNT);

    // Check if the code matches
    if (payload.code !== verifyCodeDto.code) {
      throw new UnauthorizedException({ message: ERROR_MESSAGES.auth.INVALID_CODE });
    }

    const user = await this.userService.findOne({
      where: { email: payload.email },
      select: ['id']
    });
    if (!user) {
      throw new NotFoundException({ message: ERROR_MESSAGES.auth.USER_NOT_FOUND });
    }

    // Change user status to ACTIVE
    await this.userService.updateUserById(user.id, {
      status: UserStatus.ACTIVE,
      isActive: true
    });

    return { message: ERROR_MESSAGES.common.SUCCESSFUL };
  }

  async login(loginDto: LoginDto, ipAddress?: string): Promise<IResponseData> {
    // Check if user exists
    let user = await this.userService.findOne({
      where: { email: loginDto.email }
    });
    if (!user) {
      // Save failed login history
      this.eventEmitter.emit('auth.login.logged', new LoginEvent(LoginStatus.FAILED, LoginMethod.CREDENTIALS, loginDto.email, ipAddress));
      throw new UnauthorizedException({ message: ERROR_MESSAGES.auth.INVALID_CREDENTIALS });
    }

    // Validate account status and handle suspension
    user = await this.resolveUserStatus(user);

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user, ipAddress);
      return;
    }

    // After verifying password, handle based on user's active status (INACTIVE or ACTIVE)
    // Handle inactive user - send verification email, not generate tokens
    if (user.status === UserStatus.INACTIVE) {
      const verificationToken = await this.sendVerifyEmail(
        user.id,
        user.email,
        TEMPLATE_MAIL.RESEND_VERIFICATION_CODE.subject,
        TEMPLATE_MAIL.RESEND_VERIFICATION_CODE.name
      );

      const authUser = await this.userService.updateUserById(
        user.id,
        {
          failedLoginAttempt: 0,
          failedLoginTime: null
        },
        ['id', 'email', 'firstName', 'lastName', 'status', 'createdAt']
      );

      const authResponse: ILoginResponse = {
        verificationToken,
        user: authUser
      };

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: authResponse
      };
    }

    // Handle active user - generate tokens
    const tokens = await this.generateAuthTokens(user.id, user.email, user.role);

    const authUser = await this.userService.updateUserById(
      user.id,
      {
        failedLoginAttempt: 0,
        failedLoginTime: null,
        refreshToken: tokens.refreshToken
      },
      ['id', 'email', 'firstName', 'lastName', 'status', 'createdAt']
    );

    const authResponse: ILoginResponse = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: authUser
    };

    // Save successful login history
    this.eventEmitter.emit('auth.login.logged', new LoginEvent(LoginStatus.SUCCESS, LoginMethod.CREDENTIALS, loginDto.email, ipAddress));

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: authResponse
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<IResponseData> {
    const secret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    const payload: IJwtPayload = await this.verifyToken(refreshTokenDto.refreshToken, secret, JwtType.REFRESH);

    const user = await this.userService.findOneById(payload.id);

    if (!user || user.refreshToken !== refreshTokenDto.refreshToken) {
      throw new UnauthorizedException({ message: ERROR_MESSAGES.auth.INVALID_TOKEN });
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({ message: ERROR_MESSAGES.auth.USER_NOT_ACTIVE });
    }

    // Generate new tokens
    const tokens = await this.generateAuthTokens(payload.id, payload.email, user.role);

    // Store new refresh token
    this.userService.updateUserById(user.id, { refreshToken: tokens.refreshToken });

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: tokens
    };
  }

  async logout(id: number): Promise<IResponseData> {
    // Remove the refresh token from the user
    await this.userService.updateUserById(id, { refreshToken: null });

    return { message: ERROR_MESSAGES.common.SUCCESSFUL };
  }

  async socialLogin(socialLoginDto: SocialLoginDto, ipAddress?: string): Promise<IResponseData> {
    let email: string;

    switch (socialLoginDto.method) {
      case LoginMethod.GOOGLE: {
        email = await this.getEmailFromGoogleCode(socialLoginDto.code);
        break;
      }
      // case LoginMethod.FACEBOOK: {
      //   email = await this.getEmailFromFacebookCode(socialLoginDto.code);
      //   break;
      // }
      // case LoginMethod.GITHUB: {
      //   email = await this.getEmailFromGithubCode(socialLoginDto.code);
      //   break;
      // }
    }

    const user = await this.getOrCreateActiveUser(email);

    const tokens = await this.generateAuthTokens(user.id, email, user.role);
    const authUser = await this.userService.updateUserById(
      user.id,
      {
        failedLoginAttempt: 0,
        failedLoginTime: null,
        refreshToken: tokens.refreshToken
      },
      ['id', 'email', 'firstName', 'lastName', 'status', 'createdAt']
    );

    const authResponse: ILoginResponse = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: authUser
    };

    // Save successful login history
    this.eventEmitter.emit('auth.login.logged', new LoginEvent(LoginStatus.SUCCESS, socialLoginDto.method, email, ipAddress));

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: authResponse
    };
  }

  async verifyToken(token: string, secret: string, type: JwtType): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, { secret });

      if (payload.type !== type) {
        throw new BadRequestException({ message: ERROR_MESSAGES.auth.INVALID_TOKEN_TYPE });
      }

      return payload;
    } catch (error) {
      throw new BadRequestException({ message: ERROR_MESSAGES.auth.INVALID_TOKEN });
    }
  }

  private async generateAuthTokens(id: number, email: string, role: UserRole) {
    const accessTokenPayload: IJwtPayload = {
      id,
      email,
      role,
      type: JwtType.ACCESS,
      iat: Math.floor(Date.now() / 1000)
    };

    const refreshTokenPayload: IJwtPayload = {
      id,
      email,
      role,
      type: JwtType.REFRESH,
      iat: Math.floor(Date.now() / 1000)
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRATION') || '1h'
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION') || '7d'
      })
    ]);

    return { accessToken, refreshToken };
  }

  private async sendVerifyEmail(id: number, email: string, subject: string, template: string) {
    // Generate OTP code
    const code = randomNumericCode();

    // Send verification email
    this.mailService.sendEmail(subject, MAIL_FROM, email, {
      template,
      context: { name: email, code }
    });

    // Generate verification token
    const verificationTokenPayload: IAccountVerifyPayload = {
      id,
      email,
      code,
      type: JwtType.VERIFY_ACCOUNT,
      iat: Math.floor(Date.now() / 1000)
    };

    const verificationToken = await this.jwtService.signAsync(verificationTokenPayload, {
      secret: this.configService.get<string>('ACCOUNT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: (this.configService.get<string>('ACCOUNT_VERIFICATION_TOKEN_EXPIRATION') as any) || ('1h' as any)
    });

    return verificationToken;
  }

  private checkUserStillSuspended(user: User): boolean {
    if (user.status !== UserStatus.SUSPENDED) {
      return false;
    }
    const now = new Date(Date.now());
    const suspensionTime = user.failedLoginTime;
    const timeDiff = now.getTime() - suspensionTime.getTime();

    const matchingRule = LOGIN_FAILURE_RULES.find((rule) => rule.attempt === user.failedLoginAttempt);
    const suspensionDuration = matchingRule ? matchingRule.duration : 0;

    return timeDiff < suspensionDuration;
  }

  private async resolveUserStatus(user: User): Promise<User> {
    const loginFailureData = {
      failedLoginAttempt: user.failedLoginAttempt,
      failedLoginTime: user.failedLoginTime
    };

    switch (user.status) {
      case UserStatus.BLOCKED: {
        throw new LockedException({
          message: ERROR_MESSAGES.auth.ACCOUNT_PERMANENTLY_BLOCKED,
          data: loginFailureData
        });
      }

      case UserStatus.SUSPENDED: {
        if (this.checkUserStillSuspended(user)) {
          throw new LockedException({
            message: ERROR_MESSAGES.auth.ACCOUNT_TEMPORARILY_BLOCKED,
            data: loginFailureData
          });
        }

        // Reset suspension if time has passed
        const updatedUser = await this.userService.updateUserById(user.id, {
          status: user.isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE
        });

        return updatedUser;
      }

      case UserStatus.INACTIVE:
      case UserStatus.ACTIVE:
      default: {
        return user;
      }
    }
  }

  private async handleFailedLogin(user: User, ipAddress?: string): Promise<void> {
    const newFailedLoginAttempt = user.failedLoginAttempt + 1;
    const newFailedLoginTime = new Date(Date.now());

    // Save failed login history
    this.eventEmitter.emit('auth.login.logged', new LoginEvent(LoginStatus.FAILED, LoginMethod.CREDENTIALS, user.email, ipAddress));

    if (newFailedLoginAttempt > MAX_FAILED_LOGIN_ATTEMPT) {
      // If failed attempts exceed maxFailedLoginAttempt (> 6), block the account
      await this.userService.updateUserById(user.id, {
        failedLoginAttempt: newFailedLoginAttempt,
        failedLoginTime: newFailedLoginTime,
        status: UserStatus.BLOCKED
      });

      throw new LockedException({
        message: ERROR_MESSAGES.auth.ACCOUNT_PERMANENTLY_BLOCKED,
        data: {
          failedLoginAttempt: newFailedLoginAttempt,
          failedLoginTime: newFailedLoginTime
        }
      });
    }

    if (LOGIN_FAILURE_RULES.some((rule) => rule.attempt === newFailedLoginAttempt)) {
      // If failed attempts reach one of the defined limits (5 and 6), suspend the account
      await this.userService.updateUserById(user.id, {
        failedLoginAttempt: newFailedLoginAttempt,
        failedLoginTime: newFailedLoginTime,
        status: UserStatus.SUSPENDED
      });

      throw new LockedException({
        message: ERROR_MESSAGES.auth.ACCOUNT_TEMPORARILY_BLOCKED,
        data: {
          failedLoginAttempt: newFailedLoginAttempt,
          failedLoginTime: newFailedLoginTime
        }
      });
    }

    // If failed attempts are less than 5, just update the count
    await this.userService.updateUserById(user.id, {
      failedLoginAttempt: newFailedLoginAttempt,
      failedLoginTime: newFailedLoginTime
    });
    throw new BadRequestException({ message: ERROR_MESSAGES.auth.INVALID_PASSWORD });
  }

  async requestResetPassword(requestResetPasswordDto: RequestResetPasswordDto): Promise<IResponseData> {
    const user = await this.userService.findOne({
      where: { email: requestResetPasswordDto.email }
    });

    if (!user) {
      throw new NotFoundException({ message: ERROR_MESSAGES.auth.EMAIL_NOT_FOUND });
    }

    const resetToken = await this.sendResetPasswordEmail(user.id, user.email);

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: { token: resetToken }
    };
  }

  private async sendResetPasswordEmail(id: number, email: string) {
    // Generate OTP code
    const code = randomNumericCode();

    // Send reset password email
    this.mailService.sendEmail(TEMPLATE_MAIL.SEND_RESET_PASSWORD.subject, MAIL_FROM, email, {
      template: TEMPLATE_MAIL.SEND_RESET_PASSWORD.name,
      context: { name: email, code }
    });

    // Generate reset password token
    const resetTokenPayload: IPasswordResetPayload = {
      id,
      email,
      code,
      type: JwtType.PASSWORD_RESET,
      iat: Math.floor(Date.now() / 1000)
    };

    const resetToken = await this.jwtService.signAsync(resetTokenPayload, {
      secret: this.configService.get<string>('RESET_PASSWORD_SECRET'),
      expiresIn: (this.configService.get<string>('RESET_PASSWORD_TOKEN_EXPIRATION') as any) || ('60s' as any)
    });

    return resetToken;
  }

  async verifyResetCode(verifyCodeDto: VerifyCodeDto): Promise<IResponseData> {
    // Validate the token
    const secret = this.configService.get<string>('RESET_PASSWORD_SECRET');
    const payload: IPasswordResetPayload = await this.verifyToken(verifyCodeDto.token, secret, JwtType.PASSWORD_RESET);

    // Check if the code matches
    if (payload.code !== verifyCodeDto.code) {
      throw new UnauthorizedException({ message: ERROR_MESSAGES.auth.INVALID_CODE });
    }

    // Create a new token without code
    const token = await this.jwtService.signAsync(
      {
        id: payload.id,
        type: JwtType.PASSWORD_RESET
      },
      {
        secret: this.configService.get<string>('RESET_PASSWORD_SECRET'),
        expiresIn: (this.configService.get<string>('RESET_PASSWORD_TOKEN_EXPIRATION') as any) || ('10m' as any)
      }
    );

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: { token }
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<IResponseData> {
    // Validate the token
    const secret = this.configService.get<string>('RESET_PASSWORD_SECRET');
    const payload: IPasswordResetPayload = await this.verifyToken(resetPasswordDto.token, secret, JwtType.PASSWORD_RESET);

    // Get user by ID
    const user = await this.userService.findOneById(payload.id, {
      select: ['id', 'password']
    });

    if (!user) {
      throw new BadRequestException({ message: ERROR_MESSAGES.user.USER_NOT_FOUND });
    }

    // Compare new password with current password
    const isSameAsCurrent = await bcrypt.compare(resetPasswordDto.newPassword, user.password);
    if (isSameAsCurrent) {
      throw new BadRequestException({ message: ERROR_MESSAGES.auth.INVALID_PASSWORD });
    }

    await this.userService.updateUserById(user.id, { password: resetPasswordDto.newPassword });

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: null
    };
  }

  private async getEmailFromGoogleCode(code: string): Promise<string> {
    try {
      // Exchange authorization code for id_token
      const tokenUrl = this.configService.get<string>('GOOGLE_TOKEN_URL');

      const params = new URLSearchParams({
        code,
        client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        client_secret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
        redirect_uri: this.configService.get<string>('GOOGLE_CALLBACK_URI'),
        grant_type: 'authorization_code'
      });

      const tokenData = await firstValueFrom(
        this.httpService.post(tokenUrl, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      );

      const idToken = tokenData.data.id_token;

      // Decode the id_token to get user information
      const userInfo = this.jwtService.decode(idToken);

      const email = userInfo.email;
      if (!email) {
        throw new BadRequestException({ message: ERROR_MESSAGES.auth.EMAIL_NOT_FOUND });
      }

      return email;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const googleError = error.response.data;

        if (googleError.error === 'invalid_grant') {
          throw new UnauthorizedException({ message: ERROR_MESSAGES.auth.INVALID_OR_EXPIRED_AUTH_CODE });
        }
      }

      throw error;
    }
  }

  // private async getEmailFromFacebookCode(code: string): Promise<string> {
  //   try {
  //     // Exchange authorization code for access token
  //     const tokenUrl = this.configService.get<string>('FACEBOOK_TOKEN_URL');

  //     const params = new URLSearchParams({
  //       code,
  //       client_id: this.configService.get<string>('FACEBOOK_CLIENT_ID'),
  //       client_secret: this.configService.get<string>('FACEBOOK_CLIENT_SECRET'),
  //       redirect_uri: this.configService.get<string>('FACEBOOK_CALLBACK_URI')
  //     });

  //     const tokenData = await firstValueFrom(this.httpService.get(`${tokenUrl}?${params.toString()}`));

  //     const accessToken = tokenData.data.access_token;

  //     // Get user information from user info url (graph API)
  //     const userInfoUrl = this.configService.get<string>('FACEBOOK_USER_INFO_URL') + `&access_token=${accessToken}`;

  //     const userInfo = await firstValueFrom(this.httpService.get(userInfoUrl));

  //     const email = userInfo.data.email;
  //     if (!email) {
  //       throw new BadRequestException({ message: ERROR_MESSAGES.auth.EMAIL_NOT_FOUND });
  //     }

  //     return email;
  //   } catch (error) {
  //     if (error instanceof AxiosError && error.response) {
  //       const facebookError = error.response.data.error;

  //       if (facebookError && facebookError.code === 100) {
  //         throw new UnauthorizedException({ message: ERROR_MESSAGES.auth.INVALID_OR_EXPIRED_AUTH_CODE });
  //       }
  //     }

  //     throw error;
  //   }
  // }

  // private async getEmailFromGithubCode(code: string): Promise<string> {
  //   try {
  //     // Exchange authorization code for access token
  //     const tokenUrl = this.configService.get<string>('GITHUB_TOKEN_URL');

  //     const params = new URLSearchParams({
  //       code,
  //       client_id: this.configService.get<string>('GITHUB_CLIENT_ID'),
  //       client_secret: this.configService.get<string>('GITHUB_CLIENT_SECRET')
  //     });

  //     const tokenData = await firstValueFrom(
  //       this.httpService.post(tokenUrl, params.toString(), {
  //         headers: { Accept: 'application/json' }
  //       })
  //     );

  //     const accessToken = tokenData.data.access_token;

  //     // Get primary email from email url
  //     const emailUrl = this.configService.get<string>('GITHUB_EMAIL_URL');

  //     const emails = await firstValueFrom(
  //       this.httpService.get(emailUrl, {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //           Accept: 'application/vnd.github.v3+json'
  //         }
  //       })
  //     );

  //     const email = emails.data.find((email) => email.primary && email.verified)?.email;

  //     if (!email) {
  //       throw new BadRequestException({ message: ERROR_MESSAGES.auth.EMAIL_NOT_FOUND });
  //     }

  //     return email;
  //   } catch (error) {
  //     if (error instanceof AxiosError && error.response) {
  //       const githubError = error.response.data;

  //       if (githubError && githubError.error === 'bad_verification_code') {
  //         throw new UnauthorizedException({ message: ERROR_MESSAGES.auth.INVALID_OR_EXPIRED_AUTH_CODE });
  //       }
  //     }

  //     throw error;
  //   }
  // }

  private async getOrCreateActiveUser(email: string): Promise<User> {
    let user = await this.userService.findOne({
      where: { email }
    });

    // If user does not exist, create a new user
    if (!user) {
      return this.userService.createUser({
        email,
        password: randomString(),
        status: UserStatus.ACTIVE,
        isActive: true,
        role: UserRole.USER
      });
    }

    // If user exist, validate account status and update user status to ACTIVE if INACTIVE
    user = await this.resolveUserStatus(user);

    if (user.status === UserStatus.INACTIVE) {
      return this.userService.updateUserById(user.id, {
        status: UserStatus.ACTIVE,
        isActive: true
      });
    }

    return user;
  }
}
