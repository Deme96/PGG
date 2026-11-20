import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import multer from 'multer';
import { musicUploadsDirectory } from './musicUpload.ts';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1, fields: 2, fieldSize: 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.fieldname !== 'file') {
      return callback(new Error('Campo de ficheiro não suportado.'));
    }
    const extension = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
      return callback(new Error('Formato de imagem não suportado. Use JPG, PNG ou WebP.'));
    }
    callback(null, true);
  }
});

export const parseImageUpload: RequestHandler = (req, res, next) => {
  upload.single('file')(req, res, error => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
        error: error.code === 'LIMIT_FILE_SIZE'
          ? 'A imagem deve ter no máximo 10 MB.'
          : 'A imagem enviada não é válida.'
      });
    }
    return res.status(400).json({
      error: error instanceof Error ? error.message : 'Falha ao processar a imagem.'
    });
  });
};

export async function saveImageUpload(file: Express.Multer.File): Promise<string> {
  const extension = path.extname(file.originalname).toLowerCase();
  const buffer = file.buffer;
  const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
  const isWebp = buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';

  const valid =
    (extension === '.jpg' || extension === '.jpeg') ? isJpeg :
      extension === '.png' ? isPng :
        extension === '.webp' ? isWebp : false;

  if (!valid) throw new Error('O conteúdo do ficheiro não corresponde a uma imagem válida.');

  await fs.mkdir(musicUploadsDirectory, { recursive: true });
  const filename = `${randomUUID()}${extension}`;
  await fs.writeFile(path.join(musicUploadsDirectory, filename), buffer, { flag: 'wx' });
  return `/api/uploads/${filename}`;
}
