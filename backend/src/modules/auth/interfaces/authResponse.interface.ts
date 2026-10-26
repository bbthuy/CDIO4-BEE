import { IUserData } from 'src/modules/users/interfaces/user.interface';

export interface IRegisterResponse {
  verificationToken: string;
  user: IUserData;
}

export interface ILoginResponse {
  verificationToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user: IUserData;
}
