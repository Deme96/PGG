import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { db } from '../db/database.ts';
import type { User } from '../types/index.ts';

export const ROOT_ADMIN_EMAIL = 'admin@portalgospel.gw';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
type StoredUser = User & { passwordHash?: string; passwordSalt?: string };

interface AdminSession {
  userId: string;
  expiresAt: number;
}

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

function passwordsMatch(provided: string, expected: string): boolean {
  const providedDigest = createHash('sha256').update(provided).digest();
  const expectedDigest = createHash('sha256').update(expected).digest();
  return timingSafeEqual(providedDigest, expectedDigest);
}

export function createPasswordCredentials(password: string): { passwordHash: string; passwordSalt: string } {
  const passwordSalt = randomBytes(16).toString('hex');
  const passwordHash = scryptSync(password, passwordSalt, 64).toString('hex');
  return { passwordHash, passwordSalt };
}

function userPasswordMatches(user: StoredUser, provided: string): boolean {
  if (!user.passwordHash || !user.passwordSalt) return false;
  const expected = Buffer.from(user.passwordHash, 'hex');
  if (expected.length !== 64) return false;
  const actual = scryptSync(provided, user.passwordSalt, 64);
  return timingSafeEqual(actual, expected);
}

export function createAdminSession(email: unknown, password: unknown) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    return { error: 'E-mail ou palavra-passe inválidos.', status: 401 as const };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.getCollection('users').find(candidate => candidate.email.toLowerCase() === normalizedEmail);
  if (!user || user.isActive === false) {
    return { error: 'E-mail ou palavra-passe inválidos.', status: 401 as const };
  }

  if (isRootAdmin(user)) {
    const configuredPassword = process.env.PGG_ADMIN_PASSWORD;
    if (!configuredPassword || configuredPassword === 'replace-with-a-strong-password') {
      return {
        error: 'Configure uma palavra-passe própria em PGG_ADMIN_PASSWORD no ambiente do backend.',
        status: 503 as const
      };
    }
    if (!passwordsMatch(password, configuredPassword)) {
      return { error: 'E-mail ou palavra-passe inválidos.', status: 401 as const };
    }
  } else if (!Array.isArray(user.adminPermissions) || !userPasswordMatches(user, password)) {
    return { error: 'E-mail ou palavra-passe inválidos.', status: 401 as const };
  }

  const token = randomBytes(32).toString('hex');
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + SESSION_TTL_MS });
  return { user: sanitizeUser(user), token };
}

export function getAdminSession(token: string | undefined) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  const user = db.getCollection('users').find(candidate => candidate.id === session.userId);
  if (!user || user.isActive === false || (!isRootAdmin(user) && !Array.isArray(user.adminPermissions))) {
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
