import { Controller, Get, Query } from '@nestjs/common';
import { EstadisticasVentasService } from './estadisticas-ventas.service';

@Controller('estadisticas-ventas')
export class EstadisticasVentasController {
  constructor(private readonly service: EstadisticasVentasService) {}

  @Get()
  resumen(@Query('periodo') periodo: string = 'mes') {
    return this.service.resumen(periodo);
  }

  @Get('excel')
  exportExcel() {
    return this.service.exportExcel();
  }

  @Get('pdf')
  exportPdf() {
    return this.service.exportPdf();
  }
}
