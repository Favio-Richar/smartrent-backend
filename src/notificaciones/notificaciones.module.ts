import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [NotificacionesController],
  providers: [NotificacionesService, PrismaService],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
