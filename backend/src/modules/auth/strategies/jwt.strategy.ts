import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../users/user.service';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';
import { IJwtPayload } from '../interfaces/jwtPayload.interface';
import { getPermissionsByRole } from 'src/modules/common/constants/defaultRolePermissions.constant';

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

    const user = await this.userService.getAuthUser(payload.id);
    if (!user || user.data.status === 'blocked' || user.data.status === 'suspended') {
      throw new UnauthorizedException(ERROR_MESSAGES.auth.USER_NOT_ACTIVE);
    }
    const permissions = getPermissionsByRole(payload.role);
    return {
      id: payload.id,
      email: payload.email,
      user: user.data,
      role: payload.role,
      permissions: permissions
    };
  }
}
