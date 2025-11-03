import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';

@Controller('properties') // con prefix global 'api' → /api/properties
export class PropertiesController {
  constructor(private readonly svc: PropertiesService) {}

  // --------------------------- Helpers ---------------------------
  /** Extrae user/company desde req.user y headers de fallback (no rompe si aún no integras JWT) */
  private ownerFromReq(req: any) {
    return {
      userId:
        req?.user?.id ??
        req?.user?.userId ??
        (req?.headers?.['x-user-id'] ? Number(req.headers['x-user-id']) : undefined),
      companyId:
        req?.user?.companyId ??
        req?.user?.empresaId ??
        (req?.headers?.['x-company-id'] ? Number(req.headers['x-company-id']) : undefined),
    };
  }

  // ======================= Mis propiedades =======================
  // GET /api/properties/me?page=1&limit=10&q=&state=&type=&category=&comuna=&priceMin=&priceMax=&sort=updated_desc
  @Get('me')
  async myList(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('state') state?: 'draft' | 'published' | 'paused' | 'archived',
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('comuna') comuna?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('sort') sort?: 'updated_desc' | 'updated_asc' | 'price_desc' | 'price_asc',
  ) {
    const owner = this.ownerFromReq(req);
    return this.svc.myList(owner, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      q,
      state,
      type,
      category,
      comuna,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      sort,
    });
  }

  // GET /api/properties/me/metrics
  @Get('me/metrics')
  async myMetrics(@Req() req: any) {
    const owner = this.ownerFromReq(req);
    return this.svc.myMetrics(owner);
  }

  // PATCH /api/properties/:id/state  body: { state: 'draft'|'published'|'paused'|'archived' }
  @Patch(':id/state')
  async changeState(
    @Param('id', ParseIntPipe) id: number,
    @Body('state') state: 'draft' | 'published' | 'paused' | 'archived',
    @Req() req: any,
  ) {
    if (!state) throw new BadRequestException('state requerido');
    const owner = this.ownerFromReq(req);
    return this.svc.updateState(id, state, owner);
  }

  // POST /api/properties/:id/clone
  @Post(':id/clone')
  async clone(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const owner = this.ownerFromReq(req);
    return this.svc.clone(id, owner);
  }

  // ======================= Catálogo general ======================
  // Acepta page/limit y también skip/take/offset (lo manda tu app)
  @Get()
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('offset') offset?: string,
    @Query('tipo') tipo?: string,
    @Query('categoria') categoria?: string,
    @Query('comuna') comuna?: string,
    @Query('ubicacion') ubicacion?: string,
    @Query('min') min?: string,
    @Query('max') max?: string,
    @Query('sort') sort?: 'price_asc' | 'price_desc',
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 12;
    const sk = skip ?? offset;
    const tk = take ?? limit;
    const pageFromSkip =
      sk && tk ? Math.floor(parseInt(sk, 10) / Math.max(parseInt(tk, 10), 1)) + 1 : p;

    return this.svc.list({
      page: pageFromSkip,
      limit: l,
      tipo,
      categoria,
      comuna,
      ubicacion,
      min: min ? Number(min) : undefined,
      max: max ? Number(max) : undefined,
      sort,
    });
  }

  // ⚠️ utils antes de :id
  @Get('utils/comunas')
  async comunas() {
    return this.svc.getComunas();
  }

  @Get('utils/tipos')
  async tipos() {
    return this.svc.getTipos();
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
      throw new BadRequestException('Request body vacío o inválido');
    }
    return this.svc.create(body);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
      throw new BadRequestException('Request body vacío o inválido');
    }
    return this.svc.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
