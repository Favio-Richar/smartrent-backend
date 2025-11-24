import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilePostService {
  constructor(private readonly prisma: PrismaService) {}

  // ======================================================
  // Crear nueva publicación
  // ======================================================
  async createPost(dto: any) {
    console.log("👉 POST DTO RECIBIDO:", dto);

    // ❗ Validación para evitar error P2003
    if (!dto.userId || dto.userId === 0) {
      throw new BadRequestException("userId inválido o no enviado.");
    }

    // ❗ Validar que el usuario exista
    const existe = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!existe) {
      throw new NotFoundException(`El usuario ${dto.userId} no existe.`);
    }

    // ✔ Crear post seguro
    return this.prisma.profilePost.create({
      data: {
        userId: dto.userId,
        texto: dto.texto,
        titulo: dto.titulo ?? undefined,
        imagen: dto.imagen ?? undefined,
        video: dto.video ?? undefined,
        miniatura: dto.miniatura ?? undefined,
        duracion: dto.duracion ?? undefined,
        ubicacion: dto.ubicacion ?? undefined,
        tags: dto.tags ?? undefined,
        tipo: dto.tipo ?? 'text',
        isPublic: dto.isPublic ?? true,
        repostId: dto.repostId ?? undefined,
      },
    });
  }

  // ======================================================
  // Obtener todos los posts con nombre + avatar
  // ======================================================
  async getAllPosts() {
    const posts = await this.prisma.profilePost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            correo: true,
            imagen: true,
          },
        },
        likes: true,
        comments: true,
      },
    });

    return posts.map((p) => ({
      ...p,
      likes: p.likes.length,
      commentsCount: p.comments.length,
      usuarioNombre: p.user?.nombre ?? "Usuario",
      usuarioAvatar: p.user?.imagen ?? null,
    }));
  }

  // ======================================================
  // Obtener todos los posts de un usuario
  // ======================================================
  async getUserPosts(userId: number) {
    console.log("🟦 BUSCANDO POSTS DEL USUARIO:", userId);

    const posts = await this.prisma.profilePost.findMany({
      where: { userId },
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
      ...p,
      likes: p.likes.length,
      commentsCount: p.comments.length,
      usuarioNombre: p.user?.nombre ?? "Usuario",
      usuarioAvatar: p.user?.imagen ?? null,
    }));
  }

  // ======================================================
  // Eliminar post
  // ======================================================
  async deletePost(postId: number, userId: number) {
    await this.prisma.profileLike.deleteMany({ where: { postId } });
    await this.prisma.profileComment.deleteMany({ where: { postId } });

    return this.prisma.profilePost.deleteMany({
      where: { id: postId, userId },
    });
  }

  // ======================================================
  // Like / Unlike
  // ======================================================
  async toggleLike(postId: number, userId: number) {
    const exists = await this.prisma.profileLike.findFirst({
      where: { postId, userId },
    });

    if (exists) {
      await this.prisma.profileLike.delete({ where: { id: exists.id } });
      return { liked: false };
    }

    await this.prisma.profileLike.create({
      data: { postId, userId },
    });

    return { liked: true };
  }

  // ======================================================
  // Comentarios
  // ======================================================
  async addComment(dto: any) {
    return this.prisma.profileComment.create({
      data: {
        postId: dto.postId,
        userId: dto.userId,
        comentario: dto.comentario,
      },
    });
  }

  async getComments(postId: number) {
    return this.prisma.profileComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            correo: true,
            imagen: true,
          },
        },
      },
    });
  }

  // ======================================================
  // Obtener post por ID
  // ======================================================
  async getPostById(postId: number) {
    const p = await this.prisma.profilePost.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            imagen: true,
            correo: true,
          },
        },
        likes: true,
        comments: true,
      },
    });

    if (!p) return null;

    return {
      ...p,
      likes: p.likes.length,
      commentsCount: p.comments.length,
      usuarioNombre: p.user?.nombre ?? "Usuario",
      usuarioAvatar: p.user?.imagen ?? null,
    };
  }
}
