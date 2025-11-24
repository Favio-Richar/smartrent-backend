import { Module } from '@nestjs/common';
import { AdminPublicacionesService } from './admin-publicaciones.service';
import { AdminPublicacionesController } from './admin-publicaciones.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AdminPublicacionesController],
  providers: [AdminPublicacionesService, PrismaService],
})
export class AdminPublicacionesModule {}
