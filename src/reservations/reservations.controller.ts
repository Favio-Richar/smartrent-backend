// src/reservations/reservations.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reservas') // prefijo global 'api' ya está en main.ts
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // -------- helpers --------
  private getUserId(req: any): number | undefined {
    return Number(req?.user?.id ?? req?.user?.sub ?? req?.headers?.['x-user-id']);
  }
  private getOwnerId(req: any): number | undefined {
    // prioriza companyId si viene en el token/headers (caso empresa)
    return Number(
      req?.user?.companyId ??
      req?.headers?.['x-company-id'] ??
      req?.user?.id ??
      req?.user?.sub ??
      req?.headers?.['x-user-id']
    );
  }

  // POST /api/reservas
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: any) {
    const userId = this.getUserId(req);
    if (!userId) throw new Error('Usuario no autenticado');
    console.log('📦 [RESERVA][CREATE] user=', userId, 'body=', dto);
    return this.reservationsService.create(userId, dto);
  }

  // GET /api/reservas/mias
  @UseGuards(JwtAuthGuard)
  @Get('mias')
  async getMine(@Req() req: any) {
    const userId = this.getUserId(req);
    if (!userId) throw new Error('Usuario no autenticado');
    return this.reservationsService.findMine(userId);
  }

  // GET /api/reservas/recibidas
  @UseGuards(JwtAuthGuard)
  @Get('recibidas')
  async getReceived(@Req() req: any) {
    const ownerId = this.getOwnerId(req);
    if (!ownerId) return [];
    // en service ya filtra por property.userId == ownerId OR property.companyId == ownerId
    return this.reservationsService.findReceived(ownerId);
  }

  // PATCH /api/reservas/:id/estado
  @UseGuards(JwtAuthGuard)
  @Patch(':id/estado')
  async updateEstado(@Param('id') id: string, @Body('estado') estado: string) {
    return this.reservationsService.updateStatus(Number(id), estado);
  }

  // POST /api/reservas/:id/cancelar
  @UseGuards(JwtAuthGuard)
  @Post(':id/cancelar')
  async cancelar(@Param('id') id: string, @Req() req: any) {
    const userId = this.getUserId(req);
    if (!userId) throw new Error('Usuario no autenticado');
    return this.reservationsService.cancel(Number(id), userId);
  }
}
