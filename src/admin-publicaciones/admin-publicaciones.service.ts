import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminPublicacionesService {
  constructor(private prisma: PrismaService) {}

  // ============================================================
  // OBTENER TODAS LAS PUBLICACIONES DEL SISTEMA (ProfilePost)
  // ============================================================
  async getAll() {
    const posts = await this.prisma.profilePost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            imagen: true,
          },
        },
        likes: true,
        comments: true,
      },
    });

    return posts.map((p) => ({
      id: p.id,

      // multimedia
      tipo: p.tipo,
      titulo: p.titulo ?? '',
      texto: p.texto ?? '',
      imagen: p.imagen ?? null,
      video: p.video ?? null,
      miniatura: p.miniatura ?? null,

      fecha: p.createdAt,

      // usuario
      usuarioId: p.user?.id ?? null,
      usuarioNombre: p.user?.nombre ?? "Usuario",
      usuarioAvatar: p.user?.imagen ?? null,

      // empresa (NO EXISTE → SIEMPRE null)
      empresaId: null,

      // contadores
      likes: p.likes.length,
      comentarios: p.comments.length,

      // estado del post
      estado: p.isPublic ? 'Activo' : 'Oculto',

      // futuros reportes
      reportes: 0,
    }));
  }

  // ============================================================
  // ACCIONES ADMIN
  // ============================================================
  async ocultar(id: number) {
    return this.prisma.profilePost.update({
      where: { id },
      data: { isPublic: false },
    });
  }

  async aprobar(id: number) {
    return this.prisma.profilePost.update({
      where: { id },
      data: { isPublic: true },
    });
  }

  async eliminar(id: number) {
    return this.prisma.profilePost.delete({
      where: { id },
    });
  }

  async marcarSensible(id: number) {
    return this.prisma.profilePost.update({
      where: { id },
      data: { tags: '#sensible' },
    });
  }
}
