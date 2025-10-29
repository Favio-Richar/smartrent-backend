import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.job.findMany({
      include: {
        company: { select: { id: true, nombreEmpresa: true, logo: true } },
      },
      orderBy: { id: 'desc' },
    });
  }

  async findById(id: number) {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            nombreEmpresa: true,
            logo: true,
            descripcion: true,
            correo: true,
            telefono: true,
          },
        },
      },
    });
  }

  async create(data: any) {
    return this.prisma.job.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.job.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.job.delete({ where: { id } });
  }

  // ============================================================
  // POSTULACIONES
  // ============================================================

  async postularAEmpleo(jobId: number, userId: number) {
    const existe = await this.prisma.application.findFirst({
      where: { jobId, userId },
    });
    if (existe) throw new Error('Ya postulaste a este empleo');

    return this.prisma.application.create({
      data: { jobId, userId, estado: 'En revisión' },
    });
  }

  async findPostulacionesPorUsuario(userId: number) {
    return this.prisma.application.findMany({
      where: { userId },
      include: { job: { select: { id: true, titulo: true, ubicacion: true } } },
    });
  }

  async findPostulantesPorEmpleo(jobId: number) {
    return this.prisma.application.findMany({
      where: { jobId },
      include: { user: { select: { id: true, nombre: true, correo: true } } },
    });
  }
}
