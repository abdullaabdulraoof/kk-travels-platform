import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AdminRole } from '../database/entities/admin-user.entity.js';
import type { SafeAdminProfile } from './types.js';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: SafeAdminProfile }>();

    if (request.user?.role !== AdminRole.OWNER) {
      throw new ForbiddenException('Owner access required');
    }

    return true;
  }
}
