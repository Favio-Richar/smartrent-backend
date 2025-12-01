import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EstadisticasVentasService {
  constructor(private prisma: PrismaService) {}

  // -----------------------------------------------------------
  // 📌 Rango por período
  // -----------------------------------------------------------
  getRange(periodo: string) {
    const now = new Date();
    let from = new Date();

    switch (periodo) {
      case 'dia':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;

      case 'semana':
        from = new Date();
        from.setDate(now.getDate() - 7);
        break;

      case 'anio':
        from = new Date(now.getFullYear(), 0, 1);
        break;

      default:
      case 'mes':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return { from, to: now };
  }

  // -----------------------------------------------------------
  // 📌 RESUMEN PRINCIPAL DE VENTAS
  // -----------------------------------------------------------
  async resumen(periodo: string) {
    const { from, to } = this.getRange(periodo);

    const published = await this.prisma.venta.count({
      where: { status: 'published', createdAt: { gte: from, lte: to } },
    });

    const sold = await this.prisma.venta.count({
      where: { status: 'sold', updatedAt: { gte: from, lte: to } },
    });

    const reservations = await this.prisma.reservaVenta.count({
      where: { estado: 'pendiente', fecha: { gte: from, lte: to } },
    });

    const cancelled = await this.prisma.reservaVenta.count({
      where: { estado: 'cancelada', fecha: { gte: from, lte: to } },
    });

    const visitasAgg = await this.prisma.venta.aggregate({
      _sum: { visitas: true },
    });

    const earningsAgg = await this.prisma.venta.aggregate({
      _sum: { price: true },
      where: { status: 'sold' },
    });

    return {
      published,
      sold,
      reservations,
      cancelled,
      views: visitasAgg._sum.visitas ?? 0,
      earnings: earningsAgg._sum.price ?? 0,
    };
  }

  // -----------------------------------------------------------
  // 📌 EXPORT EXCEL
  // -----------------------------------------------------------
  async exportExcel() {
    return { ok: true, msg: 'Excel generado (placeholder)' };
  }

  // -----------------------------------------------------------
  // 📌 EXPORT PDF
  // -----------------------------------------------------------
  async exportPdf() {
    return { ok: true, msg: 'PDF generado (placeholder)' };
  }
}
