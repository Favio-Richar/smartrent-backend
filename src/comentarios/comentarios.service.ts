import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';

@Injectable()
export class ComentariosService {
  constructor(private prisma: PrismaService) {}

  async crearComentario(dto: CreateComentarioDto) {
    return await this.prisma.comment.create({
      data: {
        contenido: dto.contenido,
        propertyId: dto.propertyId,
        userId: dto.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            imagen: true,
          },
        },
      },
    });
  }

  async obtenerComentarios(propertyId: number) {
    return await this.prisma.comment.findMany({
      where: { propertyId },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            imagen: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }
}
