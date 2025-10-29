import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect(); // 🔹 Conecta automáticamente al iniciar el módulo
    console.log('✅ Prisma conectado a la base de datos');
  }

  async onModuleDestroy() {
    await this.$disconnect(); // 🔹 Cierra la conexión cuando se detiene el servidor
    console.log('🛑 Prisma desconectado');
  }
}
