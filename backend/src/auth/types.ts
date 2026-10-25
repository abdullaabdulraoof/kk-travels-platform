import type { AdminRole } from '../database/entities/admin-user.entity.js';

export interface SafeAdminProfile {
  id: string;
  email: string;
  isActive: boolean;
  role: AdminRole;
}
