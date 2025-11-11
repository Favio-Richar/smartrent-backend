import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { UploadsService } from './uploads.service';
import * as path from 'path';
import * as fs from 'fs';
import { diskStorage } from 'multer';

const tmpStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const dst = path.join(process.cwd(), 'uploads', 'tmp');
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    cb(null, dst);
  },
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, safeName);
  },
});

@Controller('uploads')
export class UploadsController {
  constructor(private readonly svc: UploadsService) {}

  // ===============================================================
  // 📸 Subir IMAGEN
  // ===============================================================
  @Post('image')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file', { storage: tmpStorage }))
  async uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo requerido');
    const tmpPath = path.join(file.destination, file.filename);
    const relUrl = await this.svc.normalizeImageToJpg(tmpPath);
    return { type: 'image', url: relUrl };
  }

  // ===============================================================
  // 🎬 Subir VIDEO
  // ===============================================================
  @Post('video')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file', { storage: tmpStorage }))
  async uploadVideo(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo requerido');
    const tmpPath = path.join(file.destination, file.filename);
    const relUrl = await this.svc.transcodeToMp4(tmpPath);
    return { type: 'video', url: relUrl };
  }
}
