import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class VentasService {
  constructor(private prisma: PrismaService) {}

  // ========================================================
  // URL FINAL ABSOLUTA
  // ========================================================
private mediaUrl(file: string | null): string | null {
  if (!file) return null;

  // si ya viene como: ventas/imagen.jpg
  if (file.startsWith("ventas/")) {
    return `${process.env.PUBLIC_BASE_URL}uploads/${file}`;
  }

  // si solo viene el nombre
  return `${process.env.PUBLIC_BASE_URL}uploads/ventas/${file}`;
}


  private mapVentaMedia(venta: any) {
    return {
      ...venta,
      image_url: this.mediaUrl(venta.image_url),
      images: (venta.images || []).map((f: string) => this.mediaUrl(f)),
      video_url: this.mediaUrl(venta.video_url),
      videos: (venta.videos || []).map((f: string) => this.mediaUrl(f)),
    };
  }

  // ========================================================
  // ELIMINAR DUPLICADOS FÍSICOS
  // ========================================================
  private async deleteDuplicateFiles(all: string[], unique: string[]) {
    const duplicates = all.filter((x) => !unique.includes(x));
    for (const file of duplicates) {
      try {
        await unlink(join(process.cwd(), 'uploads/ventas', file));
      } catch {}
    }
  }

  // ========================================================
  // CREAR VENTA
  // ========================================================
  async create(dto: CreateVentaDto, images: string[] = []) {
    const uniqueImages = [...new Set(images)];
    await this.deleteDuplicateFiles(images, uniqueImages);

    // 🔥 AÑADIR RUTA COMPLETA A BD
    const rutasFinales = uniqueImages.map((f) => `ventas/${f}`);

    const venta = await this.prisma.venta.create({
      data: {
        title: dto.title,
        description: dto.description ?? '',
        price: Number(dto.price),

        category: dto.category,
        type: dto.type,

        image_url: dto.image_url ? `ventas/${dto.image_url}` : null,
        images: rutasFinales,

        video_url: dto.video_url ? `ventas/${dto.video_url}` : null,
        videos: (dto.videos ?? []).map((v) => `ventas/${v}`),

        stock: dto.stock ? Number(dto.stock) : null,
        marca: dto.marca ?? null,
        modelo: dto.modelo ?? null,
        color: dto.color ?? null,
        estado: dto.estado ?? null,

        street: dto.street ?? null,
        location: dto.location ?? null,
        comuna: dto.comuna ?? null,
        metro: dto.metro ?? null,
        latitude: dto.latitude ? Number(dto.latitude) : null,
        longitude: dto.longitude ? Number(dto.longitude) : null,

        companyName: dto.companyName ?? null,
        contactName: dto.contactName ?? null,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
        whatsapp: dto.whatsapp ?? null,
        website: dto.website ?? null,

        userId: Number(dto.userId),
      },
      include: {
        user: true,
        reservas: true,
        resenas: true,
        favoritos: true,
        _count: {
          select: { reservas: true, resenas: true, favoritos: true },
        },
      },
    });

    return this.mapVentaMedia(venta);
  }

  // ========================================================
  // LISTAR TODAS (ADMIN)
  // ========================================================
  async findAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;

    const where: any = {};

    if (query.category)
      where.category = { contains: query.category, mode: 'insensitive' };
    if (query.comuna)
      where.comuna = { contains: query.comuna, mode: 'insensitive' };
    if (query.type)
      where.type = { contains: query.type, mode: 'insensitive' };

    if (query.min) where.price = { gte: Number(query.min) };
    if (query.max)
      where.price = { ...(where.price || {}), lte: Number(query.max) };

    const rows = await this.prisma.venta.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: true,
        reservas: true,
        resenas: true,
        favoritos: true,
        _count: { select: { reservas: true, resenas: true, favoritos: true } },
      },
    });

    return rows.map((v) => this.mapVentaMedia(v));
  }

  // ========================================================
  // PUBLICADAS
  // ========================================================
  async findPublicadas(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;

    const where: any = { status: 'published' };

    if (query.category)
      where.category = { contains: query.category, mode: 'insensitive' };
    if (query.comuna)
      where.comuna = { contains: query.comuna, mode: 'insensitive' };
    if (query.type)
      where.type = { contains: query.type, mode: 'insensitive' };

    if (query.min) where.price = { gte: Number(query.min) };
    if (query.max)
      where.price = { ...(where.price || {}), lte: Number(query.max) };

    const rows = await this.prisma.venta.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: true,
        reservas: true,
        resenas: true,
        favoritos: true,
        _count: { select: { reservas: true, resenas: true, favoritos: true } },
      },
    });

    return rows.map((v) => this.mapVentaMedia(v));
  }

  // ========================================================
  // MIS VENTAS
  // ========================================================
  async findByUser(userId: number) {
    const rows = await this.prisma.venta.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        reservas: true,
        resenas: true,
        favoritos: true,
        _count: { select: { reservas: true, resenas: true, favoritos: true } },
      },
    });

    return rows.map((v) => this.mapVentaMedia(v));
  }

  // ========================================================
  // DETALLE
  // ========================================================
  async findOne(id: number) {
    const venta = await this.prisma.venta.findUnique({
      where: { id },
      include: {
        user: true,
        reservas: true,
        resenas: true,
        favoritos: true,
        _count: { select: { reservas: true, resenas: true, favoritos: true } },
      },
    });

    return this.mapVentaMedia(venta);
  }

  // ========================================================
  // ACTUALIZAR
  // ========================================================
  async update(id: number, dto: UpdateVentaDto, images: string[]) {
    const ventaActual = await this.prisma.venta.findUnique({
      where: { id },
    });

    if (!ventaActual) throw new Error('Venta no encontrada');

    const uniqueImages = [...new Set(images)];
    await this.deleteDuplicateFiles(images, uniqueImages);

    const finalImages =
      uniqueImages.length > 0
        ? uniqueImages.map((f) => `ventas/${f}`)
        : ventaActual.images;

    const venta = await this.prisma.venta.update({
      where: { id },
      data: {
        title: dto.title ?? ventaActual.title,
        description: dto.description ?? ventaActual.description,
        price: dto.price ? Number(dto.price) : ventaActual.price,

        category: dto.category ?? ventaActual.category,
        type: dto.type ?? ventaActual.type,

        images: finalImages,
        image_url: dto.image_url
          ? `ventas/${dto.image_url}`
          : ventaActual.image_url,

        video_url: dto.video_url
          ? `ventas/${dto.video_url}`
          : ventaActual.video_url,

        videos:
          dto.videos?.length
            ? dto.videos.map((v) => `ventas/${v}`)
            : ventaActual.videos,

        stock: dto.stock ? Number(dto.stock) : ventaActual.stock,
        marca: dto.marca ?? ventaActual.marca,
        modelo: dto.modelo ?? ventaActual.modelo,
        color: dto.color ?? ventaActual.color,
        estado: dto.estado ?? ventaActual.estado,

        street: dto.street ?? ventaActual.street,
        location: dto.location ?? ventaActual.location,
        comuna: dto.comuna ?? ventaActual.comuna,
        metro: dto.metro ?? ventaActual.metro,
        latitude: dto.latitude
          ? Number(dto.latitude)
          : ventaActual.latitude,
        longitude: dto.longitude
          ? Number(dto.longitude)
          : ventaActual.longitude,

        companyName: dto.companyName ?? ventaActual.companyName,
        contactName: dto.contactName ?? ventaActual.contactName,
        phone: dto.phone ?? ventaActual.phone,
        email: dto.email ?? ventaActual.email,
        whatsapp: dto.whatsapp ?? ventaActual.whatsapp,
        website: dto.website ?? ventaActual.website,

        userId: dto.userId ? Number(dto.userId) : ventaActual.userId,
      },
    });

    return this.mapVentaMedia(venta);
  }

  // ========================================================
  // DELETE
  // ========================================================
  async remove(id: number) {
    return this.prisma.venta.delete({ where: { id } });
  }

  // ========================================================
  // FAVORITOS
  // ========================================================
  async toggleFavorito(ventaId: number, userId: number) {
    return this.prisma.favoritoVenta.upsert({
      where: { userId_ventaId: { userId, ventaId } },
      update: {},
      create: { userId, ventaId },
    });
  }

  // ========================================================
  // RESEÑAS
  // ========================================================
  async getResenas(ventaId: number) {
    return this.prisma.resenaVenta.findMany({
      where: { ventaId },
      include: { user: true },
    });
  }

  async crearResena(data: any) {
    return this.prisma.resenaVenta.create({
      data: {
        ventaId: Number(data.ventaId),
        userId: Number(data.userId),
        comentario: data.comentario ?? '',
        puntuacion: Number(data.puntuacion ?? 5),
      },
    });
  }

  // ========================================================
  // RESERVAS
  // ========================================================
  async crearReserva(data: any) {
    return this.prisma.reservaVenta.create({
      data: {
        ventaId: Number(data.ventaId),
        userId: Number(data.userId),
        estado: 'pendiente',
        meta: data.meta ?? {},
      },
    });
  }

  async reservasMias(userId: number) {
    return this.prisma.reservaVenta.findMany({
      where: { userId },
      include: { venta: true },
    });
  }

  async reservasRecibidas(userId: number) {
    return this.prisma.reservaVenta.findMany({
      where: { venta: { userId } },
      include: { venta: true, user: true },
    });
  }

  async actualizarEstado(id: number, estado: string) {
    return this.prisma.reservaVenta.update({
      where: { id },
      data: { estado },
    });
  }

  async eliminarReserva(id: number) {
    return this.prisma.reservaVenta.delete({ where: { id } });
  }

  // ========================================================
  // STATUS
  // ========================================================
  async changeStatus(id: number, estado: string) {
    return this.prisma.venta.update({
      where: { id },
      data: { status: estado },
    });
  }

  // ========================================================
  // CLONAR
  // ========================================================
  async clone(id: number) {
    const venta = await this.prisma.venta.findUnique({ where: { id } });

    if (!venta) throw new Error('Venta no encontrada');

    const nueva = await this.prisma.venta.create({
      data: {
        ...venta,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      },
    });

    return this.mapVentaMedia(nueva);
  }

  // ========================================================
// 📊 ESTADÍSTICAS COMPLETAS DE VENTAS (BACKEND OFICIAL)
// ========================================================
async estadisticasVentas(userId: number) {

  // 📌 1. Publicadas
  const published = await this.prisma.venta.count({
    where: { userId, estado: "published" }
  });

  // 📌 2. Vendidas (ventas con reserva confirmada)
  const sold = await this.prisma.reservaVenta.count({
    where: { estado: "confirmada", userId }
  });

  // 📌 3. Reservas totales
  const reservations = await this.prisma.reservaVenta.count({
    where: { userId }
  });

  // 📌 4. Canceladas
  const cancelled = await this.prisma.reservaVenta.count({
    where: { estado: "cancelada", userId }
  });

  // 📌 5. Ganancias
  const gananciasSum = await this.prisma.reservaVenta.aggregate({
    where: { estado: "confirmada", userId },
    _sum: { total: true }
  });

  const earnings = gananciasSum._sum.total ?? 0;

  // 📌 6. Visitas
  const visitasSum = await this.prisma.venta.aggregate({
    where: { userId },
    _sum: { visitas: true }
  });

  const views = visitasSum._sum.visitas ?? 0;

  return {
    published,
    sold,
    reservations,
    cancelled,
    earnings,
    views,
  };
}

}
