// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global: todas las rutas quedan bajo /api
  app.setGlobalPrefix('api');

  // CORS (dev): permite llamadas desde el emulador y web local
  app.enableCors({
    origin: true,           // acepta cualquier origen en desarrollo
    credentials: true,
  });

  // Validación y transformación DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // elimina campos extra no definidos en DTO
    transform: true,        // transforma tipos (string->number, etc.)
    forbidNonWhitelisted: false,
  }));

  const PORT = Number(process.env.PORT ?? 3000);

  // 👇 Importante: escuchar en 0.0.0.0 para que el emulador llegue
  await app.listen(PORT, '0.0.0.0');
  console.log(`✅ API ready on http://localhost:${PORT}/api`);
}
bootstrap();
