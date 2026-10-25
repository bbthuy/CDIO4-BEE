import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../auth.service';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException(ERROR_MESSAGES.auth.AUTHORIZATION_HEADER_REQUIRED);
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException(ERROR_MESSAGES.auth.INVALID_AUTHORIZATION_FORMAT);
    }

    try {
      const payload = await this.authService.validateToken(token);
      req['user'] = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException(ERROR_MESSAGES.auth.INVALID_TOKEN);
    }
  }
}
