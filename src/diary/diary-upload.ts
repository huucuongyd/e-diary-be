import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

type NestMulterOptions = NonNullable<Parameters<typeof FileInterceptor>[1]>;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const diaryImageUpload: NestMulterOptions = {
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(
        new BadRequestException('Only jpeg, png, webp, and gif images are allowed'),
        false,
      );
      return;
    }
    cb(null, true);
  },
};
