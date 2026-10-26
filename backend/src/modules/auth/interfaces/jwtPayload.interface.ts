import { UserRole } from 'src/modules/users/interfaces/user.interface';

export enum JwtType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  VERIFY_ACCOUNT = 'verify-account',
  PASSWORD_RESET = 'password-reset',
  HEADER_PROJECT_ID = 'header-project-id'
}

export interface IJwtBasePayload {
  id: number;
  type: JwtType;
  iat?: number;
  exp?: number;
}

// Standard JWT payload với user info
export interface IJwtPayload extends IJwtBasePayload {
  email: string;
  role: UserRole;
  type: JwtType.ACCESS | JwtType.REFRESH;
}

export interface IAccountVerifyPayload extends IJwtBasePayload {
  email: string;
  code: string;
  type: JwtType.VERIFY_ACCOUNT;
}

export interface IPasswordResetPayload extends IJwtBasePayload {
  email: string;
  code: string;
  type: JwtType.PASSWORD_RESET;
}

export interface IHeaderProjectIdPayload extends IJwtBasePayload {
  type: JwtType.HEADER_PROJECT_ID;
}
