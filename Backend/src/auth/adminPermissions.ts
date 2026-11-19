import { isRootAdmin } from './adminAuth.ts';
import type { AdminPermission, User } from '../types/index.ts';

const modulePermissions: Array<{ permission: AdminPermission; path: RegExp }> = [
  { permission: 'departments', path: /^\/departments(?:\/|$)/ },
  { permission: 'hr', path: /^\/(staff|schedules)(?:\/|$)/ },
  { permission: 'patrimony', path: /^\/(assets|liabilities)(?:\/|$)/ },
  { permission: 'correspondence', path: /^\/(coverage-requests|partnerships|music-requests)(?:\/|$)/ },
  { permission: 'finances', path: /^\/finances(?:\/|$)/ },
  { permission: 'settings', path: /^\/(settings|articles|videos|carousel-slides|logs|backups)(?:\/|$)/ }
];

export function canAccessAdminPath(user: User, path: string): boolean {
  if (isRootAdmin(user) || path === '/auth/session' || path === '/auth/logout') return true;
  if (/^\/auth\/users(?:\/|$)/.test(path)) return false;

  const requiredPermission = modulePermissions.find(module => module.path.test(path))?.permission;
  if (requiredPermission) return user.adminPermissions?.includes(requiredPermission) === true;
  return false;
}
