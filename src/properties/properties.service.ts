import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  private toNumber(v: any): number | null {
    if (v === null || v === undefined) return null;
    if (v instanceof Decimal) return Number(v.toString());
    if (typeof v === 'string') return v.trim() === '' ? null : Number(v);
    if (typeof v === 'number') return v;
    return Number(v);
  }

  private normalizeIn(payload: AnyObj, forUpdate = false): AnyObj {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Body inválido');
    }
    const p = payload;

    const take = (...keys: string[]) => keys.map((k) => p[k]).find((v) => v !== undefined);
    const toNum = (v: any) =>
      v === '' || v === null || v === undefined ? undefined : Number(v);
    const toBool = (v: any) => v === true || v === 'true' || v === 1 || v === '1';

    let metadata = take('metadata', 'meta');
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch {
        metadata = undefined;
      }
    }

    const data: AnyObj = {
      title: take('title', 'titulo'),
      description: take('description', 'descripcion'),
      price: toNum(take('price', 'precio')),
      category: take('category', 'categoria'),
      location: take('location', 'ubicacion'),
      comuna: take('comuna'),
      type: take('type', 'tipo'),
      imageUrl: take('image_url', 'imagen', 'imageUrl'),
      videoUrl: take('video_url', 'videoUrl'),
      latitude: toNum(take('latitude')),
      longitude: toNum(take('longitude')),
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

    if (!forUpdate) {
      if (!data.title || String(data.title).trim() === '') {
        throw new BadRequestException('title/titulo es requerido');
      }
      if (data.price === undefined || Number.isNaN(data.price)) {
        throw new BadRequestException('price/precio es requerido y numérico');
      }
      if (!data.category) data.category = 'general';
      if (!data.type) data.type = 'propiedad';
    } else {
      Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
    }

    return data;
  }

  private mapProperty(p: any) {
    return {
      id: p.id,
      title: p.titulo ?? p.title ?? null,
      description: p.descripcion ?? p.description ?? null,
      price: this.toNumber(p.precio),
      category: p.categoria ?? p.category ?? null,
      location: p.ubicacion ?? p.location ?? null,
      comuna: p.comuna ?? null,
      type: p.tipo ?? p.type ?? null,
      image_url: p.imagen ?? p.imageUrl ?? null,
      video_url: p.videoUrl ?? null,
      latitude: this.toNumber(p.latitude),
      longitude: this.toNumber(p.longitude),
      featured: p.destacado ?? p.featured ?? false,
      area: this.toNumber(p.area),
      bedrooms: this.toNumber(p.dormitorios ?? p.bedrooms),
      bathrooms: this.toNumber(p.banos ?? p.bathrooms),
      year: this.toNumber(p.anio ?? p.year),
      createdAt: p.fechaPublicacion ?? p.createdAt ?? null,
      updatedAt: p.updatedAt ?? null,
      state: p.state ?? 'draft',
      visitas: this.toNumber(p.visitas) ?? 0,
      reservas: this.toNumber(p.reservas) ?? 0,
      companyName: p.companyName ?? null,
      contactName: p.contactName ?? null,
      phone: p.contactPhone ?? p.phone ?? null,
      email: p.contactEmail ?? p.email ?? null,
      whatsapp: p.whatsapp ?? null,
      website: p.website ?? null,
      metadata: p.metadata ?? null,
      userId: p.userId ?? null,
      companyId: p.companyId ?? null,
    };
  }

  private buildWhere(q: ListQuery) {
    const where: AnyObj = {};
    if (q.tipo) where.tipo = { equals: q.tipo } as any; // equals no acepta mode
    if (q.categoria) where.categoria = { contains: q.categoria, mode: 'insensitive' } as any;
    if (q.comuna) where.comuna = { equals: q.comuna } as any;

    if (q.ubicacion) {
      where.OR = [
        { ubicacion: { contains: q.ubicacion, mode: 'insensitive' } as any },
        { comuna: { contains: q.ubicacion, mode: 'insensitive' } as any },
      ];
    }

    if (q.min != null || q.max != null) {
      where.precio = {};
      if (q.min != null) (where.precio as AnyObj).gte = q.min;
      if (q.max != null) (where.precio as AnyObj).lte = q.max;
    }

    return where as any;
  }

  private buildOrder(sort?: 'price_asc' | 'price_desc') {
    if (sort === 'price_asc') return { precio: 'asc' } as any;
    if (sort === 'price_desc') return { precio: 'desc' } as any;
    return { id: 'desc' } as any;
  }

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

  async getOne(id: number) {
    const p = await this.prisma.property.findUnique({ where: { id } as any } as any);
    if (!p) throw new NotFoundException('Property not found');
    return this.mapProperty(p);
  }

  async create(body: any, owner?: Owner) {
    const d = this.normalizeIn(body, false);

    const finalCompanyId =
      body?.companyId ?? body?.empresaId ?? body?.company_id ?? owner?.companyId ?? undefined;
    const finalUserId = finalCompanyId ? undefined : owner?.userId ?? undefined;

    if (!finalUserId && !finalCompanyId) {
      throw new BadRequestException('La propiedad debe tener userId o companyId (dueño).');
    }

    const toDb: AnyObj = {
      titulo: d.title,
      descripcion: d.description ?? '',
      precio: d.price,
      categoria: d.category ?? 'general',
      ubicacion: d.location ?? '',
      comuna: d.comuna ?? null,
      tipo: d.type ?? 'propiedad',
      imagen: d.imageUrl ?? body?.image_url ?? null,
      videoUrl: d.videoUrl ?? null,
      latitude: d.latitude ?? null,
      longitude: d.longitude ?? null,
      destacado: d.featured ?? false,
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
      metadata: d.metadata ?? null,
      userId: finalUserId ?? null,
      companyId: finalCompanyId ?? null,
    };

    const created = await this.prisma.property.create({ data: toDb } as any);
    return this.mapProperty(created);
  }

  async update(id: number, body: any) {
    const d = this.normalizeIn(body, true);

    const toDb: AnyObj = {
      ...(d.title !== undefined && { titulo: d.title }),
      ...(d.description !== undefined && { descripcion: d.description }),
      ...(d.price !== undefined && { precio: d.price }),
      ...(d.category !== undefined && { categoria: d.category }),
      ...(d.location !== undefined && { ubicacion: d.location }),
      ...(d.comuna !== undefined && { comuna: d.comuna }),
      ...(d.type !== undefined && { tipo: d.type }),
      ...(d.imageUrl !== undefined && { imagen: d.imageUrl }),
      ...(d.videoUrl !== undefined && { videoUrl: d.videoUrl }),
      ...(d.latitude !== undefined && { latitude: d.latitude }),
      ...(d.longitude !== undefined && { longitude: d.longitude }),
      ...(d.featured !== undefined && { destacado: d.featured }),
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
      where: { id } as any,
      data: toDb as any,
    } as any);
    return this.mapProperty(updated);
  }

  async remove(id: number) {
    await this.prisma.property.delete({ where: { id } as any } as any);
    return { ok: true };
  }

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

  private buildOwnerWhere(owner: Owner): AnyObj {
    const AND: AnyObj[] = [];
    if (owner.userId) AND.push({ userId: owner.userId });
    if (owner.companyId) AND.push({ companyId: owner.companyId });
    return AND.length ? { AND } : {};
    }

  private buildMyWhere(owner: Owner, q: MyListQuery): AnyObj {
    const AND: AnyObj[] = [];
    const OW = this.buildOwnerWhere(owner);
    if ((OW as any).AND) AND.push(...(OW as any).AND);

    if (q.q) {
      AND.push({
        OR: [
          { titulo: { contains: q.q, mode: 'insensitive' } },
          { descripcion: { contains: q.q, mode: 'insensitive' } },
          { ubicacion: { contains: q.q, mode: 'insensitive' } },
          { comuna: { contains: q.q, mode: 'insensitive' } },
          { categoria: { contains: q.q, mode: 'insensitive' } },
        ],
      });
    }
    if (q.state) AND.push({ state: q.state });
    if (q.type) AND.push({ tipo: q.type });
    if (q.category) AND.push({ categoria: q.category });
    if (q.comuna) AND.push({ comuna: q.comuna });
    if (q.priceMin !== undefined) AND.push({ precio: { gte: q.priceMin } });
    if (q.priceMax !== undefined) AND.push({ precio: { lte: q.priceMax } });

    return AND.length ? { AND } : {};
  }

  private buildMyOrder(sort?: MyListQuery['sort']) {
    switch (sort) {
      case 'updated_asc':
        return { updatedAt: 'asc' } as any;
      case 'price_desc':
        return { precio: 'desc' } as any;
      case 'price_asc':
        return { precio: 'asc' } as any;
      case 'updated_desc':
      default:
        return { updatedAt: 'desc' } as any;
    }
  }

  async myList(owner: Owner, q: MyListQuery) {
    const page = q.page && q.page > 0 ? q.page : 1;
    const limit = q.limit && q.limit > 0 ? q.limit : 10;

    const where = this.buildMyWhere(owner, q);
    const orderBy = this.buildMyOrder(q.sort);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      } as any),
      this.prisma.property.count({ where } as any),
    ]);

    return {
      items: items.map((p) => this.mapProperty(p)),
      total,
      page,
      limit,
    };
  }

  async myMetrics(owner: Owner) {
    const base = this.buildOwnerWhere(owner);

    const [published, drafts, paused, archived, views, reservations] =
      await this.prisma.$transaction([
        this.prisma.property.count({ where: { AND: [base, { state: 'published' }] } as any }),
        this.prisma.property.count({ where: { AND: [base, { state: 'draft' }] } as any }),
        this.prisma.property.count({ where: { AND: [base, { state: 'paused' }] } as any }),
        this.prisma.property.count({ where: { AND: [base, { state: 'archived' }] } as any }),
        this.prisma.property.aggregate({ _sum: { visitas: true }, where: base as any } as any),
        this.prisma.property.aggregate({ _sum: { reservas: true }, where: base as any } as any),
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

  async updateState(
    id: number,
    state: 'draft' | 'published' | 'paused' | 'archived',
    owner?: Owner,
  ) {
    const p = await this.prisma.property.findUnique({ where: { id } as any } as any);
    if (!p) throw new NotFoundException('Property not found');

    if (owner?.userId && p.userId && p.userId !== owner.userId) {
      throw new NotFoundException('Property not found');
    }
    if (owner?.companyId && p.companyId && p.companyId !== owner.companyId) {
      throw new NotFoundException('Property not found');
    }

    const updated = await this.prisma.property.update({
      where: { id } as any,
      data: { state } as any,
    } as any);

    return this.mapProperty(updated);
  }

  async clone(id: number, owner?: Owner) {
    const orig = await this.prisma.property.findUnique({ where: { id } as any } as any);
    if (!orig) throw new NotFoundException('Property not found');

    if (owner?.userId && orig.userId && orig.userId !== owner.userId) {
      throw new NotFoundException('Property not found');
    }
    if (owner?.companyId && orig.companyId && orig.companyId !== owner.companyId) {
      throw new NotFoundException('Property not found');
    }

    const { id: _id, createdAt, updatedAt, visitas, reservas, ...rest } = orig as any;

    const copy = await this.prisma.property.create({
      data: {
        ...rest,
        titulo: `${orig.titulo} (copia)`,
        state: 'draft',
        visitas: 0,
        reservas: 0,
      } as any,
    } as any);

    return this.mapProperty(copy);
  }
}
