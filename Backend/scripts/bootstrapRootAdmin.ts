import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../src/db/database.ts';
import {
  createPasswordCredentials,
  isRootAdmin,
  ROOT_ADMIN_EMAIL
} from '../src/auth/adminAuth.ts';
import type { User } from '../src/types/index.ts';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });

type StoredUser = User & { passwordHash?: string; passwordSalt?: string };

try {
  const password = process.env.PGG_ADMIN_BOOTSTRAP_PASSWORD;
  if (!password || password.length < 12 || password.length > 128) {
    throw new Error('Defina PGG_ADMIN_BOOTSTRAP_PASSWORD temporariamente com 12 a 128 caracteres.');
  }

  await db.initialize();
  const existingUser = await db.findUserByEmail<StoredUser>(ROOT_ADMIN_EMAIL);
  if (existingUser && !isRootAdmin(existingUser)) {
    throw new Error('O e-mail principal já pertence a uma conta que não tem o papel admin.');
  }
  if (existingUser?.passwordHash || existingUser?.passwordSalt) {
    throw new Error('A conta principal já tem credenciais armazenadas; o bootstrap foi interrompido.');
  }

  const credentials = createPasswordCredentials(password);
  if (existingUser) {
    await db.update('users', existingUser.id, {
      name: 'Administrador PGG',
      role: 'admin',
      isActive: true,
      ...credentials
    });
  } else {
    await db.insert('users', {
      id: 'pgg-root-admin',
      name: 'Administrador PGG',
      email: ROOT_ADMIN_EMAIL,
      role: 'admin',
      isActive: true,
      ...credentials
    });
  }

  console.log(`Credenciais do administrador ${ROOT_ADMIN_EMAIL} gravadas no ficheiro de dados.`);
  console.log('Remova PGG_ADMIN_BOOTSTRAP_PASSWORD do ambiente do serviço.');
} catch (error) {
  console.error('Bootstrap do administrador falhou:', error);
  process.exitCode = 1;
}
