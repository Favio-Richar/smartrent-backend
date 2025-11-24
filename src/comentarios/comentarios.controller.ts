import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';

@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // ============================================================
  // 🔥 POST /comentarios  → crear comentario
  // ============================================================
  @Post()
  crear(@Body() dto: CreateComentarioDto) {
    return this.comentariosService.crearComentario(dto);
  }

  // ============================================================
  // 🔥 GET /comentarios/:propertyId  → obtener comentarios
  // ============================================================
  @Get(':propertyId')
  obtener(@Param('propertyId') id: string) {
    return this.comentariosService.obtenerComentarios(Number(id));
  }
}
