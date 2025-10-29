import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👉 Prefijo global para que todas las rutas cuelguen de /api
  app.setGlobalPrefix('api');

  // (opcional pero recomendado)
  app.enableCors({
    origin: ['http://localhost:3000', 'http://10.0.2.2:3000', '*'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
