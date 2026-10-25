import { UserRole } from '../../users/interfaces/user.interface';

export interface IJwtPayload {
  id: number;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

/**
 * Payload of the short-lived tokens used by the OTP flows.
 *  - verification            : issued after register / login of an inactive account, used with the 6-digit code to activate it
 *  - password-reset          : issued by "forgot password", used with the 6-digit code
 *  - password-reset-confirmed: issued after the code was verified, used to set the new password
 */
export type OtpTokenType = 'verification' | 'password-reset' | 'password-reset-confirmed';

export interface IOtpTokenPayload {
  type: OtpTokenType;
  /** user id (0 for a decoy token of an unknown email) */
  uid: number;
  /** verification code id (verification / password-reset) */
  cid?: string;
  /** fingerprint of the current password hash, makes password-reset-confirmed single use */
  ph?: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    role: UserRole;
  };
}

export interface ILoginDto {
  email: string;
  password: string;
}

export interface IRefreshTokenDto {
  refreshToken: string;
}

export interface ILogoutDto {
  refreshToken: string;
}
