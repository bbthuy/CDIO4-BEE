import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../auth.service';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';
import { UnauthorizedException } from 'src/common/exceptions/unauthorized.exception';
import { JwtType } from '../interfaces/jwtPayload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException({ message: ERROR_MESSAGES.auth.AUTHORIZATION_HEADER_REQUIRED });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException({ message: ERROR_MESSAGES.auth.INVALID_AUTHORIZATION_FORMAT });
    }

    try {
      const secret = this.configService.get('ACCESS_TOKEN_SECRET');
      const payload = await this.authService.verifyToken(token, secret, JwtType.ACCESS);
      req['user'] = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException({ message: ERROR_MESSAGES.common.UNAUTHORIZED_ACCESS_DENIED });
    }
  }
}
