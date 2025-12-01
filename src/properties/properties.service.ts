import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

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

type MyListQuery = {
  page?: number;
  limit?: number;
  q?: string;
  state?: 'draft' | 'published' | 'paused' | 'archived';
  type?: string;
  category?: string;
  comuna?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: 'updated_desc' | 'updated_asc' | 'price_desc' | 'price_asc';
};

type Owner = { userId?: number; companyId?: number };
type AnyObj = Record<string, any>;

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  private base() {
    return process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  private abs(u?: string | null) {
    if (!u) return null;
    if (u.startsWith('http')) return u;
    return `${this.base()}${u.startsWith('/') ? '' : '/'}${u}`;
  }

  private toNumber(v: any): number | null {
    if (v === null || v === undefined) return null;
    if (v instanceof Decimal) return Number(v.toString());
    if (typeof v === 'string') return v.trim() === '' ? null : Number(v);
    if (typeof v === 'number') return v;
    return Number(v);
  }

  // ===============================================================
  // NORMALIZADOR DE ENTRADA
  // ===============================================================
  private normalizeIn(payload: AnyObj, forUpdate = false): AnyObj {
    if (!payload || typeof payload !== 'object') payload = {};
    const p = payload;

    const take = (...keys: string[]) => keys.map((k) => p[k]).find((v) => v !== undefined);
    const toNum = (v: any) =>
      v === '' || v === null || v === undefined || Number.isNaN(Number(v))
        ? undefined
        : Number(v);

    const toBool = (v: any) =>
      v === true || v === 'true' || v === 1 || v === '1';

    let metadata = take('metadata', 'meta');
    if (typeof metadata === 'string') {
      try { metadata = JSON.parse(metadata); } catch { metadata = undefined; }
    }

    let imagesArr: string[] = [];
    if (Array.isArray(p.images)) imagesArr = p.images;
    else if (typeof p.images === 'string' && p.images.trim() !== '') imagesArr = [p.images.trim()];
    else if (Array.isArray(p.gallery)) imagesArr = p.gallery;

    let videosArr: string[] = [];
    if (Array.isArray(p.videos)) videosArr = p.videos;
    else if (typeof p.videos === 'string' && p.videos.trim() !== '') videosArr = [p.videos.trim()];
    else if (p.videoUrl) videosArr = [p.videoUrl];

    let imageUrl = take('image_url', 'imagen', 'imageUrl');
    if (!imageUrl && imagesArr.length) imageUrl = imagesArr[0];
    let videoUrl = take('video_url', 'videoUrl');
    if (!videoUrl && videosArr.length) videoUrl = videosArr[0];

    const data: AnyObj = {
      title: take('title', 'titulo') ?? '(sin título)',
      description: take('description', 'descripcion') ?? '',
      price: toNum(take('price', 'precio')) ?? 0,
      category: take('category', 'categoria') ?? 'general',

      // ✔ CAMPO CORRECTO
      location: take('location', 'ubicacion') ?? null,

      comuna: take('comuna') ?? null,
      type: take('type', 'tipo') ?? 'propiedad',
      imageUrl,
      images: imagesArr,
      videoUrl,
      videos: videosArr,
      latitude: toNum(take('latitude')),
      longitude: toNum(take('longitude')),

      // ✔ CAMPO CORRECTO: "featured"
      featured: toBool(take('featured', 'destacado')),

      area: toNum(take('area')),
      bedrooms: toNum(take('bedrooms', 'dormitorios')),
      bathrooms: toNum(take('bathrooms', 'banos')),
      year: toNum(take('year', 'anio')),

      companyName: take('companyName', 'company_name'),
      contactName: take('contactName', 'contact_name'),
      phone: take('phone', 'contact_phone'),
      email: take('email', 'contact_email'),
      whatsapp: take('whatsapp'),
      website: take('website'),
      metadata,
      userId: toNum(take('userId', 'user_id')),
      companyId: toNum(take('companyId', 'company_id', 'empresaId')),
    };

    if (forUpdate)
      Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

    return data;
  }

  // ===============================================================
  // MAPEO FINAL PARA ENVIAR AL FRONTEND
  // ===============================================================
  private mapProperty(p: any) {
    let videosSrc: any[] = [];

    if (Array.isArray(p.videos) && p.videos.length > 0) videosSrc = p.videos;
    else if (typeof p.videos === 'string' && p.videos.trim() !== '') videosSrc = [p.videos];
    else if (p.videoUrl) videosSrc = [p.videoUrl];

    const videos = videosSrc.map((v: string) => this.abs(v));

    return {
      id: p.id,
      title: p.titulo ?? p.title,
      description: p.descripcion ?? p.description,
      price: this.toNumber(p.precio),
      category: p.categoria ?? p.category,

      // ✔ CAMPO CORRECTO
      location: p.location,

      comuna: p.comuna,
      type: p.tipo ?? p.type,
      image_url: this.abs(p.imagen),
      images: (p.images ?? []).map((i: string) => this.abs(i)),
      video_url: this.abs(p.videoUrl),
      videos,
      latitude: this.toNumber(p.latitude),
      longitude: this.toNumber(p.longitude),

      // ✔ CAMPO CORRECTO
      featured: p.featured ?? false,

      area: this.toNumber(p.area),
      bedrooms: this.toNumber(p.dormitorios),
      bathrooms: this.toNumber(p.banos),
      year: this.toNumber(p.anio),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      state: p.state,
      visitas: this.toNumber(p.visitas),
      reservas: this.toNumber(p.reservas),
      companyName: p.companyName,
      contactName: p.contactName,
      phone: p.contactPhone,
      email: p.contactEmail,
      whatsapp: p.whatsapp,
      website: p.website,
      metadata: p.metadata,
      userId: p.userId,
      companyId: p.companyId,
    };
  }

  // ===============================================================
  // LISTAR PUBLICAS
  // ===============================================================
  async list(q: ListQuery) {
    const page = q.page && q.page > 0 ? Number(q.page) : 1;
    const limit = q.limit && q.limit > 0 ? Number(q.limit) : 12;

    const where: AnyObj = {};
    if (q.tipo) where.tipo = { equals: q.tipo };
    if (q.categoria) where.categoria = { contains: q.categoria, mode: 'insensitive' };
    if (q.comuna) where.comuna = { equals: q.comuna };

    if (q.ubicacion) {
      where.OR = [
        { location: { contains: q.ubicacion, mode: 'insensitive' } },
        { comuna: { contains: q.ubicacion, mode: 'insensitive' } },
      ];
    }

    if (q.min != null || q.max != null) {
      where.precio = {};
      if (q.min != null) where.precio.gte = q.min;
      if (q.max != null) where.precio.lte = q.max;
    }

    const rows = await this.prisma.property.findMany({
      where,
      orderBy:
        q.sort === 'price_asc'
          ? { precio: 'asc' }
          : q.sort === 'price_desc'
          ? { precio: 'desc' }
          : { id: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return rows.map((p) => this.mapProperty(p));
  }

  // ===============================================================
  // OBTENER UNA PROPIEDAD
  // ===============================================================
  async getOne(id: number) {
    const p = await this.prisma.property.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Property not found');
    return this.mapProperty(p);
  }

  // ===============================================================
  // CREAR PROPIEDAD
  // ===============================================================
  async create(body: any, owner?: Owner) {
    const d = this.normalizeIn(body, false);

    const finalCompanyId =
      body?.companyId ??
      body?.empresaId ??
      body?.company_id ??
      owner?.companyId;

    const finalUserId = finalCompanyId ? undefined : owner?.userId;

    if (!finalUserId && !finalCompanyId)
      throw new BadRequestException('La propiedad debe tener userId o companyId');

    const toDb: AnyObj = {
      titulo: d.title,
      descripcion: d.description ?? '',
      precio: d.price,
      categoria: d.category ?? 'general',
      location: d.location ?? null,
      comuna: d.comuna ?? null,
      tipo: d.type ?? 'propiedad',
      imagen: d.imageUrl ?? null,
      images: d.images ?? [],
      videoUrl: d.videoUrl ?? null,
      videos: d.videos ?? [],

      // ✔ CAMPO CORRECTO
      featured: d.featured ?? false,

      latitude: d.latitude ?? null,
      longitude: d.longitude ?? null,
      area: d.area ?? null,
      dormitorios: d.bedrooms ?? null,
      banos: d.bathrooms ?? null,
      anio: d.year ?? null,
      companyName: d.companyName ?? null,
      contactName: d.contactName ?? null,
      contactPhone: d.phone ?? null,
      contactEmail: d.email ?? null,
      whatsapp: d.whatsapp ?? null,
      website: d.website ?? null,
      metadata: d.metadata ? (d.metadata as any) : null,
      userId: finalUserId ?? null,
      companyId: finalCompanyId ?? null,
    };

    const created = await this.prisma.property.create({ data: toDb as any });
    return this.mapProperty(created);
  }

  // ===============================================================
  // ACTUALIZAR PROPIEDAD
  // ===============================================================
  async update(id: number, body: any) {
    const d = this.normalizeIn(body, true);

    const toDb: AnyObj = {
      ...(d.title !== undefined && { titulo: d.title }),
      ...(d.description !== undefined && { descripcion: d.description }),
      ...(d.price !== undefined && { precio: d.price }),
      ...(d.category !== undefined && { categoria: d.category }),
      ...(d.location !== undefined && { location: d.location }),
      ...(d.comuna !== undefined && { comuna: d.comuna }),
      ...(d.type !== undefined && { tipo: d.type }),
      ...(d.imageUrl !== undefined && { imagen: d.imageUrl }),
      ...(d.images !== undefined && { images: d.images }),
      ...(d.videoUrl !== undefined && { videoUrl: d.videoUrl }),
      ...(d.videos !== undefined && { videos: d.videos }),

      // ✔ CAMPO CORRECTO
      ...(d.featured !== undefined && { featured: d.featured }),

      ...(d.latitude !== undefined && { latitude: d.latitude }),
      ...(d.longitude !== undefined && { longitude: d.longitude }),
      ...(d.area !== undefined && { area: d.area }),
      ...(d.bedrooms !== undefined && { dormitorios: d.bedrooms }),
      ...(d.bathrooms !== undefined && { banos: d.bathrooms }),
      ...(d.year !== undefined && { anio: d.year }),
      ...(d.companyName !== undefined && { companyName: d.companyName }),
      ...(d.contactName !== undefined && { contactName: d.contactName }),
      ...(d.phone !== undefined && { contactPhone: d.phone }),
      ...(d.email !== undefined && { contactEmail: d.email }),
      ...(d.whatsapp !== undefined && { whatsapp: d.whatsapp }),
      ...(d.website !== undefined && { website: d.website }),
      ...(d.metadata !== undefined && { metadata: d.metadata }),
      ...(d.userId !== undefined && { userId: d.userId }),
      ...(d.companyId !== undefined && { companyId: d.companyId }),
    };

    const updated = await this.prisma.property.update({
      where: { id },
      data: toDb as any,
    });

    return this.mapProperty(updated);
  }

  // ===============================================================
  // UTILIDADES
  // ===============================================================
  async myList(owner: Owner, q: MyListQuery) {
    const page = q.page && q.page > 0 ? q.page : 1;
    const limit = q.limit && q.limit > 0 ? q.limit : 10;

    const where: AnyObj = {
      OR: [
        owner.userId ? { userId: owner.userId } : {},
        owner.companyId ? { companyId: owner.companyId } : {},
      ],
    };

    const items = await this.prisma.property.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prisma.property.count({ where });

    return {
      items: items.map((p) => this.mapProperty(p)),
      total,
      page,
      limit,
    };
  }

  async myMetrics(owner: Owner) {
    const base = {
      OR: [
        owner.userId ? { userId: owner.userId } : {},
        owner.companyId ? { companyId: owner.companyId } : {},
      ],
    };

    const [published, drafts, paused, archived, views, reservations] =
      await this.prisma.$transaction([
        this.prisma.property.count({ where: { ...base, state: 'published' } }),
        this.prisma.property.count({ where: { ...base, state: 'draft' } }),
        this.prisma.property.count({ where: { ...base, state: 'paused' } }),
        this.prisma.property.count({ where: { ...base, state: 'archived' } }),
        this.prisma.property.aggregate({ _sum: { visitas: true }, where: base }),
        this.prisma.property.aggregate({ _sum: { reservas: true }, where: base }),
      ]);

    return {
      published,
      drafts,
      paused,
      archived,
      views: (views as any)._sum?.visitas ?? 0,
      reservations: (reservations as any)._sum?.reservas ?? 0,
    };
  }

  async remove(id: number) {
    await this.prisma.property.delete({ where: { id } });
    return { ok: true };
  }

  async updateState(
    id: number,
    state: 'draft' | 'published' | 'paused' | 'archived',
  ) {
    const p = await this.prisma.property.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Property not found');
    const updated = await this.prisma.property.update({
      where: { id },
      data: { state },
    });
    return this.mapProperty(updated);
  }

  async clone(id: number, owner?: Owner) {
    const orig = await this.prisma.property.findUnique({ where: { id } });
    if (!orig) throw new NotFoundException('Property not found');

    const copy = await this.prisma.property.create({
      data: {
        ...orig,
        id: undefined,
        titulo: `${orig.titulo} (copia)`,
        state: 'draft',
        visitas: 0,
        reservas: 0,
        userId: owner?.userId ?? orig.userId,
        companyId: owner?.companyId ?? orig.companyId,
      } as any,
    });

    return this.mapProperty(copy);
  }

  async getComunas() {
    const rows = await this.prisma.property.findMany({
      where: { comuna: { not: null } },
      select: { comuna: true },
      distinct: ['comuna'],
      orderBy: { comuna: 'asc' },
    });
    return rows.map((r) => r.comuna).filter(Boolean);
  }

  async getTipos() {
    const rows = await this.prisma.property.findMany({
      where: { tipo: { not: null } },
      select: { tipo: true },
      distinct: ['tipo'],
      orderBy: { tipo: 'asc' },
    });
    return rows.map((r) => r.tipo).filter(Boolean);
  }
}
