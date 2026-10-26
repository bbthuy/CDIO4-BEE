import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

/**
 * Decorator to require specific permission for an endpoint
 *
 * @param permission - The permission required to access the endpoint
 *
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard, PermissionGuard)
 * @RequirePermission(PERMISSIONS.USER_CREATE)
 * @Post('users')
 * createUser() {
 *   return this.userService.create();
 * }
 * ```
 */
export const RequirePermission = (permission: string) => SetMetadata(PERMISSION_KEY, permission);
