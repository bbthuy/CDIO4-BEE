import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { doubleCsrf } from 'csrf-csrf';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private csrf;

  constructor() {
    this.csrf = doubleCsrf({
      getSecret: () => process.env.CSRF_SECRET || 'supersecretkey',
      cookieName: 'XSRF-TOKEN',
      cookieOptions: { secure: false, sameSite: false }
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (req.method !== 'GET') {
      // Validate token for unsafe methods
      const token = req.headers['x-csrf-token'] as string;
      console.log(token, req.cookies, this.csrf.validateRequest);

      if (!this.csrf.validateRequest(req)) {
        return res.status(403).json({ message: 'Invalid CSRF token' });
      }
    }
    next();
  }
}
