import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/requirePermission.decorator';

/**
 * Guard to check if user has required permission
 *
 * This guard works with @RequirePermission decorator
 * It checks if the user has the required permission in their JWT token
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required permission from decorator
    const requiredPermission = this.reflector.get<string>(PERMISSION_KEY, context.getHandler());

    // If no permission is required, allow access
    if (!requiredPermission) {
      return true;
    }

    // Get request and user from context
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // User must be authenticated
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user permissions from JWT payload
    const userPermissions: string[] = user.permissions || [];

    // Check if user has required permission
    if (!userPermissions.includes(requiredPermission)) {
      throw new ForbiddenException(`You do not have permission: ${requiredPermission}`);
    }

    const hasPermission = user.permissions.includes(requiredPermission);

    if (!hasPermission) {
      throw new ForbiddenException(`You do not have permission: ${requiredPermission}`);
    }

    return true;
  }
}
