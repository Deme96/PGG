import { chmod, copyFile, mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { db } from '../src/db/database.ts';
import { musicUploadsDirectory } from '../src/middleware/musicUpload.ts';

function collectUploadNames(value: unknown, names = new Set<string>()): Set<string> {
  if (typeof value === 'string' && value.includes('/api/uploads/')) {
    const filename = path.posix.basename(value.split(/[?#]/, 1)[0]);
    if (filename && filename !== '.') names.add(filename);
  } else if (Array.isArray(value)) {
    value.forEach(item => collectUploadNames(item, names));
  } else if (typeof value === 'object' && value !== null) {
    Object.values(value).forEach(item => collectUploadNames(item, names));
  }
  return names;
}

try {
  const dataFile = process.env.PGG_DATA_FILE?.trim();
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error('Limpeza cancelada: DATABASE_URL não está configurada.');
  }
  if (!dataFile || !path.isAbsolute(dataFile)) {
    throw new Error('Limpeza cancelada: configure PGG_DATA_FILE num disco persistente para guardar a cópia.');
  }

  await db.initialize();
  const backupPath = `${path.resolve(dataFile)}.before-clean-${Date.now()}.json`;
  await writeFile(backupPath, await db.exportFullJSON(), { encoding: 'utf8', flag: 'wx', mode: 0o600 });

  const uploadFiles = existsSync(musicUploadsDirectory)
    ? (await readdir(musicUploadsDirectory, { withFileTypes: true })).filter(entry => entry.isFile())
    : [];
  const uploadBackupPath = `${backupPath}.uploads`;
  if (uploadFiles.length > 0) {
    await mkdir(uploadBackupPath, { mode: 0o700 });
    for (const file of uploadFiles) {
      const backupFile = path.join(uploadBackupPath, file.name);
      await copyFile(
        path.join(musicUploadsDirectory, file.name),
        backupFile
      );
      await chmod(backupFile, 0o600);
    }
  }

  const removed = await db.clearContentPreservingAdmin();
  const retained = JSON.parse(await db.exportFullJSON()) as unknown;
  const retainedUploads = collectUploadNames(retained);
  let deletedUploads = 0;
  for (const file of uploadFiles) {
    if (retainedUploads.has(file.name)) continue;
    await unlink(path.join(musicUploadsDirectory, file.name));
    deletedUploads += 1;
  }

  console.log('Limpeza concluída; definições e administrador principal foram preservados.');
  console.log(JSON.stringify({
    removed,
    deletedUploads,
    backupPath,
    uploadBackupPath: uploadFiles.length > 0 ? uploadBackupPath : null
  }));
} finally {
  await db.close();
}
