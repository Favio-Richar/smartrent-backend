// ======================================================================
// 🚀 MAIN – SmartRent+ Backend (NestJS) – VERSIÓN FINAL 2025
// ======================================================================

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import * as express from 'express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // -------------------------------------------------------------
  // 📦 Body parser – JSON
  // -------------------------------------------------------------
  app.use(bodyParser.json({ limit: '10mb' }));

  // -------------------------------------------------------------
  // 🌐 🚨 FIX OBLIGATORIO PARA WEBPAY (POST x-www-form-urlencoded)
  // -------------------------------------------------------------
  app.use(
    bodyParser.urlencoded({
      limit: '10mb',
      extended: false,          // <<— ESTO es lo que WebPay exige
      parameterLimit: 10000,
      type: 'application/x-www-form-urlencoded'
    }),
  );

  // ⚠️ Tu línea original extended:true queda ANULADA por esta corrección.
  // app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // -------------------------------------------------------------
  // 📁 Archivos estáticos
  // -------------------------------------------------------------
  const uploadsDir = join(process.cwd(), 'uploads');
  const publicDir = join(process.cwd(), 'public');

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  app.use('/uploads', express.static(uploadsDir));
  app.use('/public', express.static(publicDir));

  // -------------------------------------------------------------
  // 🔁 Prefijo global
  // -------------------------------------------------------------
  app.setGlobalPrefix('api');

  // -------------------------------------------------------------
  // 🌍 CORS ESPECIAL PARA APPS MÓVILES + WEBPAY
  // -------------------------------------------------------------
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const whitelist = [
        'http://localhost:3000',
        'http://localhost:4200',
        'http://localhost:8100',
        'http://10.0.2.2:3000',
        'http://10.0.2.2:8100',
        'https://smartrentplus.cl',
        'https://www.smartrentplus.cl',
      ];

      if (whitelist.includes(origin) || /smartrentplus\.cl$/.test(origin)) {
        return callback(null, true);
      }

      console.warn('❌ [CORS BLOQUEADO] Origen no permitido:', origin);
      return callback(new Error('CORS BLOCKED'), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // -------------------------------------------------------------
  // 🛡 Validaciones globales
  // -------------------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // -------------------------------------------------------------
  // 🚀 Levantar servidor
  // -------------------------------------------------------------
  const PORT = Number(process.env.PORT ?? 3000);
  await app.listen(PORT, '0.0.0.0');

  // -------------------------------------------------------------
  // 📋 LOGS INFORMATIVOS
  // -------------------------------------------------------------
  const base = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
  console.log('================================================');
  console.log(`✅ SmartRent+ API corriendo en: ${base}/api`);
  console.log(`📁 Static dirs: ${base}/uploads/* | ${base}/public/*`);
  console.log('🌍 CORS listo para Flutter / Emulador / Android / iOS / WebPay');
  console.log('📦 Body limit: 10MB');
  console.log('================================================');
}

bootstrap();
