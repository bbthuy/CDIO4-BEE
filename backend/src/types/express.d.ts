import { UserRole } from 'src/modules/common/constants/role.constant';
import { IUserData } from 'src/modules/users/interfaces/user.interface';

export interface IUserRequest {
  id: number;
  email: string;
  user: IUserData;
}

declare module 'express' {
  export interface Request {
    user?: IUserRequest;
  }
}
export {};
