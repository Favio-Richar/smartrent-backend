import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilePostService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly baseUrl = "http://10.0.2.2:3000/";

  private buildUrl(path: string | null): string | null {
    if (!path) return null;
    return path.startsWith("http") ? path : this.baseUrl + path;
  }

  // ======================================================
  // Crear nueva publicación
  // ======================================================
  async createPost(dto: any) {
    if (!dto.userId || dto.userId === 0) {
      throw new BadRequestException("userId inválido o no enviado.");
    }

    const existe = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!existe) {
      throw new NotFoundException(`El usuario ${dto.userId} no existe.`);
    }

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
      include: {
        user: true,
        likes: true,
        comments: true,
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
      usuarioAvatar: this.buildUrl(p.user?.imagen ?? null),
    }));
  }

  // ======================================================
  // Obtener posts de un usuario
  // ======================================================
  async getUserPosts(userId: number) {
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
      usuarioAvatar: this.buildUrl(p.user?.imagen ?? null),
    }));
  }

  // ======================================================
  // Eliminar post
  // ======================================================
  async deletePost(postId: number, userId: number) {
    await this.prisma.profileLike.deleteMany({ where: { postId } });
    await this.prisma.profileComment.deleteMany({ where: { postId } });

    await this.prisma.profilePost.deleteMany({
      where: { id: postId, userId },
    });

    return { ok: true };
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
    const comment = await this.prisma.profileComment.create({
      data: {
        postId: dto.postId,
        userId: dto.userId,
        comentario: dto.comentario,
      },
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

    return {
      ...comment,
      usuarioAvatar: this.buildUrl(comment.user?.imagen ?? null),
    };
  }

  async getComments(postId: number) {
    const comments = await this.prisma.profileComment.findMany({
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

    return comments.map((c) => ({
      ...c,
      usuarioAvatar: this.buildUrl(c.user?.imagen ?? null),
    }));
  }

  // ======================================================
  // Feed general
  // ======================================================
  async getFeed() {
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
      take: 50,
    });

    return posts.map((p) => ({
      ...p,
      likes: p.likes.length,
      commentsCount: p.comments.length,
      usuarioNombre: p.user?.nombre ?? "Usuario",
      usuarioAvatar: this.buildUrl(p.user?.imagen ?? null),
      tipoPublicacion: "perfil",
    }));
  }
}
