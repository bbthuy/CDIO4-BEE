import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IJwtPayload } from '../interfaces/auth.interface';
import { UserService } from '../../users/user.service';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService, private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET')
    });
  }

  async validate(payload: IJwtPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException(ERROR_MESSAGES.auth.INVALID_TOKEN_TYPE);
    }

    const user = await this.userService.getUserById(payload.id);
    if (!user || user.data.status === 'blocked' || user.data.status === 'suspended') {
      throw new UnauthorizedException(ERROR_MESSAGES.auth.USER_NOT_ACTIVE);
    }

    return {
      id: payload.id,
      email: payload.email,
      role: user.data.role,
      user: user.data
    };
  }
}
