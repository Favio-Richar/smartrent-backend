// src/prisma/prisma.service.ts
import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma conectado a la base de datos');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🛑 Prisma desconectado');
  }

  // Opcional: cierre limpio de Nest cuando el proceso termine.
  // Usamos process.on en vez de this.$on('beforeExit') para evitar el error de tipos.
  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
