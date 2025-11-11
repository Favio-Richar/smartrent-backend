// ===============================================================
// 🚀 MAIN – SmartRent+ Backend (NestJS)
// ---------------------------------------------------------------
// - Soporte para JSON grandes (10MB para imágenes base64)
// - CORS global
// - Validaciones globales (ValidationPipe)
// - Servir archivos estáticos (uploads y public)
// ===============================================================

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import * as express from 'express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ============================================================
  // 📦 Aumentar límite del body-parser (para imágenes Base64)
  // ============================================================
  app.use(bodyParser.json({ limit: '10mb' })); // antes 100kb por defecto
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // ============================================================
  // 📁 Directorios raíz y estáticos
  // ============================================================
  const uploadsDir = join(process.cwd(), 'uploads');
  const publicDir = join(process.cwd(), 'public');

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  // Servir archivos estáticos
  app.use('/uploads', express.static(uploadsDir));
  app.use('/public', express.static(publicDir));

  // ============================================================
  // ⚙️ Configuración global de la API
  // ============================================================
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: true, // puedes restringir con ['http://localhost:8100']
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no declaradas en DTO
      transform: true, // transforma payloads según los DTOs
    }),
  );

  // ============================================================
  // 🚀 Inicialización del servidor
  // ============================================================
  const PORT = Number(process.env.PORT ?? 3000);
  await app.listen(PORT, '0.0.0.0');

  const base = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
  console.log(`✅ API ready on ${base}/api`);
  console.log(`📁 Static mounted: ${base}/uploads/* and ${base}/public/*`);
  console.log(`📦 Body limit: 10MB`);
}

bootstrap();
