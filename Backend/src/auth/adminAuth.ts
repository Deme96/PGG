import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { db } from '../db/database.ts';
import type { User } from '../types/index.ts';

export const ROOT_ADMIN_EMAIL = 'admin@portalgospel.gw';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
type StoredUser = User & { passwordHash?: string; passwordSalt?: string };

interface AdminSession {
  userId: string;
  expiresAt: number;
}

export type AdminLoginResult =
  | { error: string; status: 401 }
  | { user: User; token: string };

const sessions = new Map<string, AdminSession>();

export function isRootAdmin(user: Pick<User, 'email' | 'role'> | null | undefined): boolean {
  return user?.role === 'admin' && user.email.toLowerCase() === ROOT_ADMIN_EMAIL;
}

export function sanitizeUser(user: StoredUser): User {
  const publicUser = { ...user };
  delete publicUser.passwordHash;
  delete publicUser.passwordSalt;
  return publicUser;
}

export function createPasswordCredentials(password: string): { passwordHash: string; passwordSalt: string } {
  const passwordSalt = randomBytes(16).toString('hex');
  const passwordHash = scryptSync(password, passwordSalt, 64).toString('hex');
  return { passwordHash, passwordSalt };
}

export function userPasswordMatches(user: StoredUser, provided: string): boolean {
  if (!user.passwordHash || !user.passwordSalt) return false;
  const expected = Buffer.from(user.passwordHash, 'hex');
  if (expected.length !== 64) return false;
  const actual = scryptSync(provided, user.passwordSalt, 64);
  return timingSafeEqual(actual, expected);
}

export async function createAdminSession(email: unknown, password: unknown): Promise<AdminLoginResult> {
  if (typeof email !== 'string' || typeof password !== 'string') {
    return { error: 'E-mail ou palavra-passe inválidos.', status: 401 };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.findUserByEmail<StoredUser>(normalizedEmail);
  if (!user || user.isActive === false) {
    return { error: 'E-mail ou palavra-passe inválidos.', status: 401 };
  }

  if (!userPasswordMatches(user, password) || (
    !isRootAdmin(user) &&
    (!Array.isArray(user.adminPermissions) || !user.adminPermissions.length)
  )) {
    return { error: 'E-mail ou palavra-passe inválidos.', status: 401 };
  }

  const token = randomBytes(32).toString('hex');
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + SESSION_TTL_MS });
  return { user: sanitizeUser(user), token };
}

export async function getAdminSession(token: string | undefined) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  const user = await db.findById<StoredUser>('users', session.userId);
  if (!user || user.isActive === false || (
    !isRootAdmin(user) &&
    (!Array.isArray(user.adminPermissions) || !user.adminPermissions.length)
  )) {
    sessions.delete(token);
    return null;
  }
  return sanitizeUser(user);
}

export function revokeAdminSession(token: string | undefined): void {
  if (token) sessions.delete(token);
}

export function revokeUserSessions(userId: string): void {
  for (const [token, session] of sessions) {
    if (session.userId === userId) sessions.delete(token);
  }
}

export function getBearerToken(authorization: string | undefined): string | undefined {
  return authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
}
