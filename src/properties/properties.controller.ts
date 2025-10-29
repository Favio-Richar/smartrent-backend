import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly svc: PropertiesService) {}

  // GET /properties?page=1&limit=12&tipo=vehiculo&categoria=...&comuna=...&min=...&max=...&sort=price_desc
  @Get()
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tipo') tipo?: string,
    @Query('categoria') categoria?: string,
    @Query('comuna') comuna?: string,
    @Query('ubicacion') ubicacion?: string,
    @Query('min') min?: string,
    @Query('max') max?: string,
    @Query('sort') sort?: 'price_asc' | 'price_desc',
  ) {
    return this.svc.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 12,
      tipo,
      categoria,
      comuna,
      ubicacion,
      min: min ? Number(min) : undefined,
      max: max ? Number(max) : undefined,
      sort,
    });
  }

  // GET /properties/:id
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.svc.getOne(id);
  }

  // POST /properties  (crear anuncio)
  @Post()
  async create(@Body() body: any) {
    return this.svc.create(body);
  }

  // PUT /properties/:id  (editar anuncio)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }

  // (Opcional) DELETE /properties/:id
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  // GET /properties/utils/comunas
  @Get('utils/comunas')
  async comunas() {
    return this.svc.getComunas();
  }

  // GET /properties/utils/tipos
  @Get('utils/tipos')
  async tipos() {
    return this.svc.getTipos();
  }
}
