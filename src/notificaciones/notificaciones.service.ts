import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  // ==========================================================
  // 🔹 CREAR NOTIFICACIÓN
  // ==========================================================
  async crearNotificacion(
    userId: number,
    titulo: string,
    mensaje: string,
    refId?: number,
    tipo: string = 'general',
  ) {
    return await this.prisma.notificacion.create({
      data: {
        userId,
        titulo,
        mensaje,
        tipo,
        refId: refId ?? null,
      },
    });
  }

  // ==========================================================
  // 🔹 OBTENER NOTIFICACIONES POR USUARIO
  // ==========================================================
  async getByUser(userId: number) {
    return await this.prisma.notificacion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================================
  // 🔹 MARCAR NOTIFICACIÓN COMO LEÍDA
  // ==========================================================
  async marcarLeida(id: number) {
    return await this.prisma.notificacion.update({
      where: { id },
      data: { leido: true },   // ← CORREGIDO 🔥 (ANTES ERA leida)
    });
  }

  // ==========================================================
  // 🔹 ELIMINAR NOTIFICACIÓN
  // ==========================================================
  async eliminar(id: number) {
    return await this.prisma.notificacion.delete({
      where: { id },
    });
  }
}
