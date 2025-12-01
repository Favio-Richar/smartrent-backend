import { Module } from '@nestjs/common';
import { EstadisticasVentasController } from './estadisticas-ventas.controller';
import { EstadisticasVentasService } from './estadisticas-ventas.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EstadisticasVentasController],
  providers: [EstadisticasVentasService, PrismaService],
})
export class EstadisticasVentasModule {}
