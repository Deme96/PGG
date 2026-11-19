import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });

const { db, pool } = await import('../src/db/database.ts');
const legacyPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data/db.json');

try {
  await db.initialize(false);
  const rawJson = await readFile(legacyPath, 'utf8');
  const counts = await db.migrateFromJSON(rawJson);
  console.log('Migração concluída; contagens importadas por coleção:');
  for (const [collection, count] of Object.entries(counts)) console.log(`  ${collection}: ${count}`);
} catch (error) {
  console.error('Migração PostgreSQL falhou:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
