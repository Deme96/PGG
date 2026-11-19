import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { Request, RequestHandler } from 'express';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const musicUploadsDirectory = path.resolve(__dirname, '../../uploads');

const MAX_AUDIO_SIZE = 20 * 1024 * 1024;
const MAX_COVER_SIZE = 5 * 1024 * 1024;
type MusicUploadKind = 'audio' | 'coverImage';

const acceptedFiles: Record<MusicUploadKind, { extensions: readonly string[]; mimeTypes: readonly string[] }> = {
  audio: {
    extensions: ['.mp3', '.wav', '.m4a', '.aac'],
    mimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/aac', 'audio/x-m4a']
  },
  coverImage: {
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_AUDIO_SIZE,
    files: 2,
    fields: 12,
    fieldSize: 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (!Object.prototype.hasOwnProperty.call(acceptedFiles, file.fieldname)) {
      return callback(new Error('Campo de ficheiro não suportado.'));
    }

    const kind = file.fieldname as MusicUploadKind;
    const rules = acceptedFiles[kind];
    const extension = path.extname(file.originalname).toLowerCase();
    if (
      !rules.extensions.includes(extension) ||
      (file.mimetype && !rules.mimeTypes.includes(file.mimetype))
    ) {
      return callback(new Error(kind === 'audio'
        ? 'Formato de áudio não suportado. Use MP3, WAV, M4A ou AAC.'
        : 'Formato de imagem não suportado. Use JPG, PNG ou WebP.'));
    }
    callback(null, true);
  }
});

export const parseMusicUpload: RequestHandler = (req, res, next) => {
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ])(req, res, error => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === 'LIMIT_FILE_SIZE';
      return res.status(tooLarge ? 413 : 400).json({
        error: tooLarge ? 'O áudio deve ter no máximo 20 MB.' : 'Os ficheiros enviados não são válidos.'
      });
    }
    return res.status(400).json({
      error: error instanceof Error ? error.message : 'Falha ao processar os ficheiros enviados.'
    });
  });
};

export function getMusicUploadFiles(req: Request): {
  audio?: Express.Multer.File;
  coverImage?: Express.Multer.File;
} {
  const files = req.files as { audio?: Express.Multer.File[]; coverImage?: Express.Multer.File[] } | undefined;
  return {
    audio: files?.audio?.[0],
    coverImage: files?.coverImage?.[0]
  };
}

export function isValidMusicUpload(file: Express.Multer.File, kind: MusicUploadKind): boolean {
  const extension = path.extname(file.originalname).toLowerCase();
  const rules = acceptedFiles[kind];
  if (!rules.extensions.includes(extension)) return false;
  if (kind === 'coverImage' && file.size > MAX_COVER_SIZE) return false;

  const buffer = file.buffer;
  if (kind === 'coverImage') {
    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
    const isWebp = buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
    return extension === '.jpg' || extension === '.jpeg' ? isJpeg : extension === '.png' ? isPng : isWebp;
  }

  const isMpegAudio = buffer.length >= 3 && (
    buffer.toString('ascii', 0, 3) === 'ID3' ||
    (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)
  );
  const isWaveAudio = buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WAVE';
  const isMp4Audio = buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp';
  const isAacAudio = buffer.length >= 2 && buffer[0] === 0xff && (buffer[1] & 0xf6) === 0xf0;
  if (extension === '.mp3') return isMpegAudio;
  if (extension === '.wav') return isWaveAudio;
  if (extension === '.m4a') return isMp4Audio;
  return isAacAudio;
}

export async function saveMusicUpload(file: Express.Multer.File): Promise<string> {
  await fs.mkdir(musicUploadsDirectory, { recursive: true });
  const extension = path.extname(file.originalname).toLowerCase();
  const filename = `${randomUUID()}${extension}`;
  await fs.writeFile(path.join(musicUploadsDirectory, filename), file.buffer, { flag: 'wx' });
  return `/api/uploads/${filename}`;
}

export async function removeMusicUpload(url: string): Promise<void> {
  const filename = path.basename(url);
  if (!filename || filename === '.' || filename === path.sep) return;
  await fs.unlink(path.join(musicUploadsDirectory, filename));
}
