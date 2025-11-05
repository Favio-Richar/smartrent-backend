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
  UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('properties') // con prefix global 'api' => /api/properties
export class PropertiesController {
  constructor(private readonly svc: PropertiesService) {}

  // --------------------------- Helpers ---------------------------
  private ownerFromReq(req: any) {
    return {
      userId:
        req?.user?.id ??
        req?.user?.sub ??
        (req?.headers?.['x-user-id'] ? Number(req.headers['x-user-id']) : undefined),
      companyId:
        req?.user?.companyId ??
        req?.user?.empresaId ??
        (req?.headers?.['x-company-id'] ? Number(req.headers['x-company-id']) : undefined),
    };
  }

  // ======================= Mis propiedades =======================
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

  @Get('me/metrics')
  async myMetrics(@Req() req: any) {
    const owner = this.ownerFromReq(req);
    return this.svc.myMetrics(owner);
  }

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

  @Post(':id/clone')
  async clone(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const owner = this.ownerFromReq(req);
    return this.svc.clone(id, owner);
  }

  // ======================= Catálogo general ======================
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

  // ======================= Crear/Actualizar/Eliminar =======================
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() body: any) {
    if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
      throw new BadRequestException('Request body vacío o inválido');
    }

    const owner = this.ownerFromReq(req);
    const companyIdFromBody =
      body?.companyId ?? body?.empresaId ?? body?.company_id ?? undefined;

    return this.svc.create(body, {
      userId: companyIdFromBody ? undefined : owner.userId,
      companyId: companyIdFromBody ? Number(companyIdFromBody) : owner.companyId,
    });
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

  @Patch(':id/owner')
  async setOwner(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() body: any,
  ) {
    const userIdFromJwt = req?.user?.id ?? req?.user?.sub ?? undefined;
    const companyIdFromBody =
      body?.companyId ?? body?.empresaId ?? body?.company_id ?? undefined;

    return this.svc.update(id, {
      userId: companyIdFromBody ? null : userIdFromJwt,
      companyId: companyIdFromBody ? Number(companyIdFromBody) : null,
    });
  }
}
