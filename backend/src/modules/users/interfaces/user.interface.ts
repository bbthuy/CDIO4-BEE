export enum UserStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  SUSPENDED = 'suspended'
}

export enum UserRole {
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  USER = 'user'
}

export interface IUser {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  password: string;
  status: UserStatus;
  role: UserRole;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  failedLoginAttempt: number;
  failedLoginTime: Date | null;
  refreshToken: string | null;
  isProjectOwner: boolean;
}

export interface IUserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  role: UserRole;
  createdAt: Date;
}
