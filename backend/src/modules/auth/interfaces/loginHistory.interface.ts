export enum LoginStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export enum LoginMethod {
  CREDENTIALS = 'CREDENTIALS',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  GITHUB = 'GITHUB',
  X = 'X'
}

export interface ILoginHistory {
  id: number;
  createdAt: Date;
  status: LoginStatus;
  method: LoginMethod;
  ipAddress?: string;
  deletedAt?: Date;
  credential: string;
}
