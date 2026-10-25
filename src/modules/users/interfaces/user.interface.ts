export enum UserStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  SUSPENDED = 'suspended'
}

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient'
}

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  status: UserStatus;
  role: UserRole;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
