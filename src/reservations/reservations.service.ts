// src/reservations/reservations.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  private get hasModel(): boolean {
    const anyPrisma = this.prisma as any;
    return !!anyPrisma.reservation && typeof anyPrisma.reservation.findMany === 'function';
  }

  private extractPropertyId(dto: any): number | null {
    const direct =
      dto.propiedad_id ?? dto.property_id ?? dto.propertyId ?? dto.propiedadId ??
      dto.propiedad ?? dto.property ?? null;

    if (direct !== null && direct !== undefined && direct !== '') return Number(direct);
    if (dto.propiedad?.id) return Number(dto.propiedad.id);
    if (dto.property?.id) return Number(dto.property.id);
    if (dto.id) return Number(dto.id);
    return null;
  }

  private buildMessage(dto: any): string {
    const parts: string[] = [];
    const baseMsg = (dto.mensaje ?? dto.message ?? dto.detalles ?? '').toString().trim();
    const nombre = (dto.nombre ?? dto.name ?? '').toString().trim();
    const correo = (dto.correo ?? dto.email ?? '').toString().trim();
    const telefono = (dto.telefono ?? dto.whatsapp ?? dto.phone ?? '').toString().trim();
    const tipoUso = (dto.tipo_uso ?? dto.uso ?? dto.useType ?? '').toString().trim();
    const contactoPref = (dto.contacto_preferido ?? dto.preferredContact ?? '').toString().trim();

    if (baseMsg) parts.push(baseMsg);
    if (nombre) parts.push(`Nombre: ${nombre}`);
    if (correo) parts.push(`Correo: ${correo}`);
    if (telefono) parts.push(`Teléfono: ${telefono}`);
    if (tipoUso) parts.push(`Tipo de uso: ${tipoUso}`);
    if (contactoPref) parts.push(`Contacto preferido: ${contactoPref}`);
    if (parts.length === 0) parts.push('Solicitud de reserva desde la app.');
    return parts.join(' | ');
  }

  async create(userId: number, dto: any) {
    const propertyId = this.extractPropertyId(dto);
    if (!propertyId) throw new Error('property_id / propiedad_id es requerido');

    // ✅ Evita P2003: asegúrate de que existan las FKs
    const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) throw new Error(`Usuario ${userId} no existe`);
    const propExists = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!propExists) throw new Error(`Propiedad ${propertyId} no existe`);

    const startRaw = dto.fecha_inicio ?? dto.startDate;
    const endRaw = dto.fecha_fin ?? dto.endDate;
    const startDate = startRaw ? new Date(startRaw) : new Date();
    const endDate = endRaw ? new Date(endRaw) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const message = this.buildMessage(dto);
    const people = dto.personas ? Number(dto.personas) : 1;

    if (this.hasModel) {
      const p = this.prisma as any;
      return p.reservation.create({
        data: {
          userId,
          propertyId,
          startDate,
          endDate,
          message,
          people,
          status: 'Pendiente',
        },
      });
    }

    const rows = await this.prisma.$queryRawUnsafe(
      `
      INSERT INTO "Reservation"
        ("propertyId","userId","startDate","endDate","message","people","status","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7, NOW(), NOW())
      RETURNING *;
    `,
      propertyId,
      Number(userId),
      startDate,
      endDate,
      message,
      people,
      'Pendiente',
    );
    return Array.isArray(rows) ? rows[0] : rows;
  }

  async findMine(userId: number) {
    if (this.hasModel) {
      const p = this.prisma as any;
      return p.reservation.findMany({
        where: { userId },
        include: { property: true },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.$queryRawUnsafe(
      `
      SELECT r.*, p.*
      FROM "Reservation" r
      LEFT JOIN "Property" p ON p.id = r."propertyId"
      WHERE r."userId" = $1
      ORDER BY r."createdAt" DESC;
    `,
      Number(userId),
    );
  }

  async findReceived(ownerId: number) {
    if (this.hasModel) {
      const p = this.prisma as any;
      return p.reservation.findMany({
        where: { OR: [{ property: { userId: ownerId } }, { property: { companyId: ownerId } }] },
        include: { property: true, user: true },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.$queryRawUnsafe(
      `
      SELECT r.*, p.*, u.*
      FROM "Reservation" r
      JOIN "Property" p ON p.id = r."propertyId"
      JOIN "User" u ON u.id = r."userId"
      WHERE p."userId" = $1 OR p."companyId" = $1
      ORDER BY r."createdAt" DESC;
    `,
      Number(ownerId),
    );
  }

  async updateStatus(id: number, estado: string) {
    if (this.hasModel) {
      const p = this.prisma as any;
      return p.reservation.update({ where: { id }, data: { status: estado } });
    }
    const rows = await this.prisma.$queryRawUnsafe(
      `
      UPDATE "Reservation"
      SET "status" = $1, "updatedAt" = NOW()
      WHERE "id" = $2
      RETURNING *;
    `,
      estado,
      id,
    );
    return Array.isArray(rows) ? rows[0] : rows;
  }

  async cancel(id: number, userId: number) {
    if (this.hasModel) {
      const p = this.prisma as any;
      return p.reservation.updateMany({ where: { id, userId }, data: { status: 'Cancelada' } });
    }
    const rows = await this.prisma.$queryRawUnsafe(
      `
      UPDATE "Reservation"
      SET "status" = 'Cancelada', "updatedAt" = NOW()
      WHERE "id" = $1 AND "userId" = $2
      RETURNING *;
    `,
      id,
      userId,
    );
    return Array.isArray(rows) ? rows[0] : rows;
  }
}
