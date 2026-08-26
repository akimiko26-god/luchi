import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { extname, join } from 'path';

const MAX_FILE_BYTES = 25 * 1024 * 1024;

const MIME_KIND: Record<string, 'PHOTO' | 'VIDEO' | 'DOCUMENT'> = {
  'image/jpeg': 'PHOTO',
  'image/png': 'PHOTO',
  'image/webp': 'PHOTO',
  'image/gif': 'PHOTO',
  'video/mp4': 'VIDEO',
  'video/webm': 'VIDEO',
  'video/quicktime': 'VIDEO',
  'application/pdf': 'DOCUMENT',
  'application/msword': 'DOCUMENT',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCUMENT',
};

export type IncomingUpload = {
  buffer: Buffer;
  size: number;
  mimetype: string;
  originalname: string;
};

export type StoredUpload = {
  url: string;
  kind: 'PHOTO' | 'VIDEO' | 'DOCUMENT';
  originalName: string;
  mimeType: string;
};

@Injectable()
export class MediaApplicationService {
  async store(file: IncomingUpload | undefined): Promise<StoredUpload> {
    if (!file) {
      throw new BadRequestException('Файл не получен');
    }
    if (file.size > MAX_FILE_BYTES) {
      throw new BadRequestException('Файл больше 25 МБ');
    }
    const kind = MIME_KIND[file.mimetype];
    if (!kind) {
      throw new BadRequestException('Допустимы фото, видео или документы PDF/DOC');
    }

    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const extension = extname(file.originalname).toLowerCase() || this.extensionFor(file.mimetype);
    const filename = `${randomUUID()}${extension}`;
    await writeFile(join(uploadsDir, filename), file.buffer);

    return {
      url: `/uploads/${filename}`,
      kind,
      originalName: file.originalname,
      mimeType: file.mimetype,
    };
  }

  private extensionFor(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return '.jpg';
    }
    if (mimeType.startsWith('video/')) {
      return '.mp4';
    }
    return '.bin';
  }
}
