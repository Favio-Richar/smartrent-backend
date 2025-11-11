import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { EstadisticasService } from './estadisticas.service';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  // ✅ Endpoint principal - obtiene resumen de estadísticas
  @Get('arriendos')
  async obtenerEstadisticasArriendos() {
    return this.estadisticasService.getResumenArriendos();
  }

  // ✅ Exportar a Excel
  @Get('arriendos/export/excel')
  async exportarExcel(@Res() res: Response) {
    const buffer = await this.estadisticasService.exportExcel();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=estadisticas_arriendos.xlsx',
    );
    res.send(buffer);
  }

  // ✅ Exportar a PDF
  @Get('arriendos/export/pdf')
  async exportarPdf(@Res() res: Response) {
    const buffer = await this.estadisticasService.exportPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=estadisticas_arriendos.pdf',
    );
    res.send(buffer);
  }
}
