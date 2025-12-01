// src/ventas/ventas.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
  BadRequestException
} from '@nestjs/common';

import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('ventas')
export class VentasController {
  constructor(private readonly service: VentasService) {}

  // ========================================================
  // 📌 CREAR VENTA
  // ========================================================
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: any,
  ) {
    if (!dto.userId) {
      throw new BadRequestException('El userId es obligatorio.');
    }

    const images = files?.map((f) => f.filename) ?? [];
    return this.service.create(dto, images);
  }

  // ========================================================
  // 📌 LISTAR TODAS LAS VENTAS (CATÁLOGO COMPLETO — ADMIN)
  // ========================================================
  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  // ========================================================
  // 📌 LISTAR SOLO VENTAS PUBLICADAS (CATÁLOGO PÚBLICO)
  // ========================================================
  @Get('publicadas')
  getPublicadas(@Query() query: any) {
    return this.service.findPublicadas(query);
  }

  // ========================================================
  // 📌 OBTENER VENTAS DEL USUARIO (MIS VENTAS)
  // ========================================================
  @Get('user/:userId')
  getByUser(@Param('userId') userId: string) {
    return this.service.findByUser(Number(userId));
  }

  // ========================================================
  // 📌 DETALLE
  // ========================================================
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // ========================================================
  // ❤️ FAVORITO NORMAL
  // ========================================================
  @Post(':id/favorito/:userId')
  toggleFavorito(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.service.toggleFavorito(+id, +userId);
  }

  // ========================================================
  // ❤️ FAVORITO COMPATIBLE FLUTTER → /ventas/:id/favorite
  // ========================================================
  @Post(':id/favorite')
  toggleFavoriteFlutter(@Param('id') id: string) {
    const userId = 1;
    return this.service.toggleFavorito(+id, userId);
  }

  // ========================================================
  // 🔁 CLONAR PUBLICACIÓN → /ventas/:id/clone
  // ========================================================
  @Post(':id/clone')
  cloneFlutter(@Param('id') id: string) {
    return this.service.clone(+id);
  }

  // ========================================================
  // 🔄 CAMBIAR STATUS → /ventas/:id/status
  // ========================================================
  @Put(':id/status')
  cambiarStatus(
    @Param('id') id: string,
    @Body() body: { estado: string },
  ) {
    return this.service.changeStatus(+id, body.estado);
  }

  // ⭐ RESEÑAS
  @Get('resenas/:ventaId')
  getResenas(@Param('ventaId') ventaId: string) {
    return this.service.getResenas(+ventaId);
  }

  @Post('resenas')
  crearResena(@Body() body: any) {
    return this.service.crearResena(body);
  }

  // ========================================================
  // 📦 RESERVAS
  // ========================================================
  @Post('reservas')
  crearReserva(@Body() body: any) {
    const data = {
      ventaId: body.ventaId || body.venta_id,
      userId: body.userId || body.user_id,
      meta: body.meta ?? {},
    };

    if (!data.ventaId || !data.userId) {
      throw new BadRequestException(
        'ventaId y userId son obligatorios para la reserva.',
      );
    }

    return this.service.crearReserva(data);
  }

  @Get('reservas/mias/:userId')
  reservasMias(@Param('userId') userId: string) {
    return this.service.reservasMias(+userId);
  }

  @Get('reservas/recibidas/:userId')
  reservasRecibidas(@Param('userId') userId: string) {
    return this.service.reservasRecibidas(+userId);
  }

  @Put('reservas/:id/estado')
  actualizarEstado(
    @Param('id') id: string,
    @Body() body: { estado: string },
  ) {
    return this.service.actualizarEstado(+id, body.estado);
  }

  @Delete('reservas/:id')
  eliminarReserva(@Param('id') id: string) {
    return this.service.eliminarReserva(+id);
  }

 // ========================================================
// 📌 ACTUALIZAR (FIX REAL Y DEFINITIVO 2025)
// ========================================================
@Put(':id')
@UseInterceptors(AnyFilesInterceptor())
async update(
  @Param('id') id: string,
  @UploadedFiles() files: Express.Multer.File[],
  @Body() dto: any,
) {

  if (!dto.userId) {
    throw new BadRequestException('El userId es obligatorio.');
  }

  // --------------------------------------------------------
  // 1️⃣ Contenido existente (images[])
  // --------------------------------------------------------
  let existingImages: string[] = [];

  if (dto['images[]']) {
    if (Array.isArray(dto['images[]'])) {
      existingImages = dto['images[]'];
    } else {
      existingImages = [dto['images[]']];
    }
  }

  // --------------------------------------------------------
  // 2️⃣ Nuevas imágenes subidas
  // --------------------------------------------------------
  const newImages = files?.map((f) => f.filename) ?? [];

  // --------------------------------------------------------
  // 3️⃣ Mezclar ambas listas
  // --------------------------------------------------------
  dto.images = [...existingImages, ...newImages];

  // --------------------------------------------------------
  // 4️⃣ Ejecutar servicio → (id, dto, images)
  // --------------------------------------------------------
  return this.service.update(+id, dto, dto.images);
}


  // ========================================================
  // 📌 ELIMINAR
  // ========================================================
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
  // ========================================================
// 📊 ESTADÍSTICAS VENTAS – PARA FLUTTER DASHBOARD PRO
// ========================================================
@Get('estadisticas/:userId')
async getEstadisticas(@Param('userId') userId: string) {
  return this.service.estadisticasVentas(Number(userId));
}

}
