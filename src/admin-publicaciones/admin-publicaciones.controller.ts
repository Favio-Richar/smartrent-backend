import { Controller, Get, Param, Patch, Delete } from '@nestjs/common';
import { AdminPublicacionesService } from './admin-publicaciones.service';

@Controller('admin/publicaciones')
export class AdminPublicacionesController {
  constructor(private service: AdminPublicacionesService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Patch(':id/ocultar')
  ocultar(@Param('id') id: string) {
    return this.service.ocultar(+id);
  }

  @Patch(':id/aprobar')
  aprobar(@Param('id') id: string) {
    return this.service.aprobar(+id);
  }

  @Patch(':id/sensible')
  sensible(@Param('id') id: string) {
    return this.service.marcarSensible(+id);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.service.eliminar(+id);
  }
}
