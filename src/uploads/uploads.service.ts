// ===============================================================
// 🔹 UPLOADS SERVICE - SmartRent+ (versión final funcional en Windows)
// ---------------------------------------------------------------
// • Procesa imágenes (sharp) y videos (ffmpeg portátil).
// • Compatible sin instalación global de ffmpeg (usa ffmpeg-static).
// ===============================================================

import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

@Injectable()
export class UploadsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // ===============================================================
  // 🖼️ Procesar imagen -> JPG optimizado (FIX TOTAL)
  // ===============================================================
  async normalizeImageToJpg(filePath: string): Promise<string> {
    try {
      // 👉 Asegurar carpeta /uploads/ventas
      const ventasDir = path.join(this.uploadDir, 'ventas');
      if (!fs.existsSync(ventasDir)) fs.mkdirSync(ventasDir, { recursive: true });

      // 👉 Guardar imagen en /uploads/ventas/
      const output = path.join(
        ventasDir,
        `${Date.now()}-${path.basename(filePath, path.extname(filePath))}.jpg`
      );

      await sharp(filePath).jpeg({ quality: 90 }).toFile(output);

      if (filePath !== output && fs.existsSync(filePath)) fs.unlinkSync(filePath);

      // 👉 URL CORRECTA Y FINAL
      return `http://10.0.2.2:3000/uploads/ventas/${path.basename(output)}`;

    } catch (err) {
      console.error('❌ Error procesando imagen:', err);
      throw new BadRequestException('Error procesando imagen');
    }
  }

  // ===============================================================
  // 🎥 Convertir video a MP4 (H.264 / AAC)
  // ===============================================================
  async transcodeToMp4(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const ext = path.extname(filePath).toLowerCase();
        const allowed = ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.mpeg', '.mpg'];

        if (!allowed.includes(ext)) {
          return reject(new BadRequestException(`Formato de video no permitido: ${ext}`));
        }

        // 👉 Asegurar carpeta /uploads/video
        const videoDir = path.join(this.uploadDir, 'video');
        if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

        const output = path.join(videoDir, `${Date.now()}-${path.basename(filePath, ext)}.mp4`);

        if (ext === '.mp4') {
          fs.renameSync(filePath, output);
          return resolve(`http://10.0.2.2:3000/uploads/video/${path.basename(output)}`);
        }

        ffmpeg(filePath)
          .outputOptions(['-c:v libx264', '-preset ultrafast', '-c:a aac', '-strict -2'])
          .on('end', () => {
            if (filePath !== output && fs.existsSync(filePath)) fs.unlinkSync(filePath);
            resolve(`http://10.0.2.2:3000/uploads/video/${path.basename(output)}`);
          })
          .on('error', (err) => {
            console.error('❌ Error procesando video:', err);
            reject(new BadRequestException('Error procesando video'));
          })
          .save(output);

      } catch (err) {
        reject(new BadRequestException('Error general al procesar video'));
      }
    });
  }
}
