import { Controller, Get, Param, Put, Delete, Body, Post } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly service: NotificacionesService) {}

  // 📌 Obtener notificaciones por usuario
  @Get(':userId')
  obtener(@Param('userId') userId: string) {
    return this.service.getByUser(Number(userId));
  }

  // 📌 Marcar como leída
  @Put(':id/leida')
  marcarLeida(@Param('id') id: string) {
    return this.service.marcarLeida(Number(id));
  }

  // 📌 Eliminar notificación
  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.service.eliminar(Number(id));
  }

  // 📌 Crear notificación manual
  @Post()
  crear(@Body() data: any) {
    return this.service.crearNotificacion(
      data.userId,
      data.titulo,
      data.mensaje,
      data.refId ?? null,
      data.tipo ?? 'general',
    );
  }
}
