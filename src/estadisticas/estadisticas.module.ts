import { Module } from '@nestjs/common';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EstadisticasController],
  providers: [EstadisticasService, PrismaService],
})
export class EstadisticasModule {}
