import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { randomBytes } from 'crypto';

import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

const RAW_DIR = join(process.cwd(), 'uploads', 'raw');

@Module({
  imports: [
    // ✅ Guardamos físicamente el archivo subido en /uploads/raw
    MulterModule.register({
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, RAW_DIR),
        filename: (_req, file, cb) => {
          const id = `${Date.now()}-${randomBytes(4).toString('hex')}`;
          // tratamos de conservar la extensión si existe
          const ext = (file.originalname?.split('.').pop() || '').trim();
          cb(null, ext ? `${id}.${ext}` : id);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
