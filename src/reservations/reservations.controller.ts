// src/reservations/reservations.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller('reservas') // ✅ SIN "api" (el prefijo global ya lo agrega)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // POST /api/reservas
  @Post()
  async create(@Req() req: any, @Body() dto: any) {
    // usa JWT -> dto.userId -> fallback 3 (debe existir en la tabla User)
    const userId = Number(req.user?.id ?? req.user?.sub ?? dto.userId ?? 3);
    console.log('📦 [RESERVA][CREATE] user=', userId, 'body=', dto);
    return this.reservationsService.create(userId, dto);
  }

  // GET /api/reservas/mias
  @Get('mias')
  async getMine(@Req() req: any) {
    const userId = Number(req.user?.id ?? req.user?.sub ?? 3);
    return this.reservationsService.findMine(userId);
  }

  // GET /api/reservas/recibidas
  @Get('recibidas')
  async getReceived(@Req() req: any) {
    const ownerId = Number(req.user?.id ?? req.user?.sub ?? 3);
    return this.reservationsService.findReceived(ownerId);
  }

  // PATCH /api/reservas/:id/estado
  @Patch(':id/estado')
  async updateEstado(@Param('id') id: string, @Body('estado') estado: string) {
    return this.reservationsService.updateStatus(Number(id), estado);
  }

  // POST /api/reservas/:id/cancelar
  @Post(':id/cancelar')
  async cancelar(@Param('id') id: string, @Req() req: any) {
    const userId = Number(req.user?.id ?? req.user?.sub ?? 3);
    return this.reservationsService.cancel(Number(id), userId);
  }
}
