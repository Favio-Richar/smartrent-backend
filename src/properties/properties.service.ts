import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ListQuery = {
  page?: number;
  limit?: number;
  tipo?: string;
  categoria?: string;
  comuna?: string;
  ubicacion?: string;
  min?: number;
  max?: number;
  sort?: 'price_asc' | 'price_desc';
};

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  // FRONT -> respuesta “front keys”
  private mapProperty(p: any) {
    return {
      id: p.id,
      title: p.titulo,
      description: p.descripcion,
      price: p.precio,
      category: p.categoria,
      location: p.ubicacion,
      comuna: p.comuna ?? null,
      type: p.tipo ?? null,
      image_url: p.imagen ?? null,
      video_url: p.videoUrl ?? null,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      featured: p.destacado ?? false,
      area: p.area ?? null,
      bedrooms: p.dormitorios ?? null,
      bathrooms: p.banos ?? null,
      year: p.anio ?? null,
      createdAt: p.fechaPublicacion,

      // Datos de empresa/Contacto (si existen en tu schema)
      companyName: p.companyName ?? null,
      contactName: p.contactName ?? null,
      phone: p.phone ?? null,
      whatsapp: p.whatsapp ?? null,
      email: p.email ?? null,
      website: p.website ?? null,
    };
  }

  // --------- WHERE (casts para no pelear con Prisma types) ----------
  private buildWhere(q: ListQuery) {
    const where: any = {};

    if (q.tipo) where.tipo = { equals: q.tipo, mode: 'insensitive' } as any;
    if (q.categoria)
      where.categoria = { contains: q.categoria, mode: 'insensitive' } as any;
    if (q.comuna) where.comuna = { equals: q.comuna, mode: 'insensitive' } as any;

    if (q.ubicacion) {
      where.OR = [
        { ubicacion: { contains: q.ubicacion, mode: 'insensitive' } as any },
        { comuna: { contains: q.ubicacion, mode: 'insensitive' } as any },
      ];
    }

    if (q.min != null || q.max != null) {
      where.precio = {};
      if (q.min != null) where.precio.gte = q.min;
      if (q.max != null) where.precio.lte = q.max;
    }

    return where as any;
  }

  // --------- ORDER BY (casts) ----------
  private buildOrder(sort?: 'price_asc' | 'price_desc') {
    if (sort === 'price_asc') return ({ precio: 'asc' } as any);
    if (sort === 'price_desc') return ({ precio: 'desc' } as any);
    return { fechaPublicacion: 'desc' } as any;
  }

  // ================== LIST & GET ==================
  async list(q: ListQuery) {
    const page = q.page && q.page > 0 ? q.page : 1;
    const limit = q.limit && q.limit > 0 ? q.limit : 12;

    const rows = await this.prisma.property.findMany({
      where: this.buildWhere(q),
      orderBy: this.buildOrder(q.sort),
      skip: (page - 1) * limit,
      take: limit,
    } as any);

    return rows.map((p: any) => this.mapProperty(p));
  }

  async getOne(id: string) {
    const p = await this.prisma.property.findUnique({
      where: { id: Number(id) } as any,
    } as any);
    return p ? this.mapProperty(p) : null;
  }

  // ================== CREATE ==================
  async create(body: any) {
    // FRONT -> DB (en español)
    const data: any = {
      titulo: body.title,
      descripcion: body.description,
      precio: body.price,
      categoria: body.category,
      ubicacion: body.location,
      comuna: body.comuna ?? null,
      tipo: body.type ?? null,
      imagen: body.image_url ?? body.imageUrl ?? null,
      videoUrl: body.video_url ?? body.videoUrl ?? null,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      destacado: body.featured ?? false,
      area: body.area ?? null,
      dormitorios: body.bedrooms ?? null,
      banos: body.bathrooms ?? null,
      anio: body.year ?? null,

      // si añadiste estos campos al modelo Property (opcional)
      companyName: body.companyName ?? null,
      contactName: body.contactName ?? null,
      phone: body.phone ?? null,
      whatsapp: body.whatsapp ?? null,
      email: body.email ?? null,
      website: body.website ?? null,

      // si usas auth: userId / companyId (de req.user) — aquí lo dejamos null
      // userId: ctx?.user?.id ?? null,
      // companyId: ctx?.user?.companyId ?? null,
    };

    const created = await this.prisma.property.create({ data });
    return this.mapProperty(created);
  }

  // ================== UPDATE ==================
  async update(id: string, body: any) {
    // Arma un objeto parcial sólo con lo que venga
    const data: any = {
      ...(body.title != null && { titulo: body.title }),
      ...(body.description != null && { descripcion: body.description }),
      ...(body.price != null && { precio: body.price }),
      ...(body.category != null && { categoria: body.category }),
      ...(body.location != null && { ubicacion: body.location }),
      ...(body.comuna != null && { comuna: body.comuna }),
      ...(body.type != null && { tipo: body.type }),
      ...(body.image_url != null && { imagen: body.image_url }),
      ...(body.video_url != null && { videoUrl: body.video_url }),
      ...(body.latitude != null && { latitude: body.latitude }),
      ...(body.longitude != null && { longitude: body.longitude }),
      ...(body.featured != null && { destacado: body.featured }),
      ...(body.area != null && { area: body.area }),
      ...(body.bedrooms != null && { dormitorios: body.bedrooms }),
      ...(body.bathrooms != null && { banos: body.bathrooms }),
      ...(body.year != null && { anio: body.year }),

      ...(body.companyName != null && { companyName: body.companyName }),
      ...(body.contactName != null && { contactName: body.contactName }),
      ...(body.phone != null && { phone: body.phone }),
      ...(body.whatsapp != null && { whatsapp: body.whatsapp }),
      ...(body.email != null && { email: body.email }),
      ...(body.website != null && { website: body.website }),
    };

    const updated = await this.prisma.property.update({
      where: { id: Number(id) },
      data,
    });
    return this.mapProperty(updated);
  }

  // ================== DELETE (opcional) ==================
  async remove(id: string) {
    await this.prisma.property.delete({ where: { id: Number(id) } as any });
    return { ok: true };
  }

  // ================== Utils ==================
  async getComunas() {
    const rows = await this.prisma.property.findMany({
      where: { comuna: { not: null } } as any,
      select: { comuna: true } as any,
      distinct: ['comuna'] as any,
      orderBy: { comuna: 'asc' } as any,
    } as any);
    return rows.map((r: any) => r.comuna).filter(Boolean);
  }

  async getTipos() {
    const rows = await this.prisma.property.findMany({
      where: { tipo: { not: null } } as any,
      select: { tipo: true } as any,
      distinct: ['tipo'] as any,
      orderBy: { tipo: 'asc' } as any,
    } as any);
    return rows.map((r: any) => r.tipo).filter(Boolean);
  }
}
