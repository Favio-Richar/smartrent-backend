// ===============================================================
// 🏠 PROPERTIES CONTROLLER - SmartRent+ (versión multimedia completa)
// ---------------------------------------------------------------
// - Compatible con todas tus rutas previas.
// - Añade soporte para múltiples imágenes y videos.
// - Usa UploadsService internamente (sin romper estructura).
// ===============================================================

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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly svc: PropertiesService) {}

  // ===============================================================
  // 🔹 Obtener IDs del usuario/empresa autenticado
  // ===============================================================
  private ownerFromReq(req: any) {
    return {
      userId:
        req?.user?.id ??
        req?.user?.sub ??
        (req?.headers?.['x-user-id']
          ? Number(req.headers['x-user-id'])
          : undefined),
      companyId:
        req?.user?.companyId ??
        req?.user?.empresaId ??
        (req?.headers?.['x-company-id']
          ? Number(req.headers['x-company-id'])
          : undefined),
    };
  }

  // ===============================================================
  // 📋 Mis propiedades (usuario/empresa logueado)
  // ===============================================================
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myList(@Req() req: any, @Query() query: any) {
    const owner = this.ownerFromReq(req);
    return this.svc.myList(owner, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/metrics')
  async myMetrics(@Req() req: any) {
    const owner = this.ownerFromReq(req);
    return this.svc.myMetrics(owner);
  }

  // ===============================================================
  // ⚙️ Estado y clonación
  // ===============================================================
  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Post(':id/clone')
  async clone(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const owner = this.ownerFromReq(req);
    return this.svc.clone(id, owner);
  }

  // ===============================================================
  // 🌎 Listado general (público)
  // ===============================================================
  @Get()
  async list(@Query() query: any) {
    return this.svc.list(query);
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

  // ===============================================================
  // 🆕 Crear propiedad con soporte multimedia (múltiples archivos)
  // ===============================================================
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: path.join(process.cwd(), 'uploads/tmp'),
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${Date.now()}-${file.fieldname}${ext}`);
        },
      }),
    }),
  )
  async create(
    @Req() req: any,
    @Body() body: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (!body) throw new BadRequestException('Body vacío');

    // ✅ Si se suben varios archivos
    const images: string[] = [];
    const videos: string[] = [];

    if (files && files.length > 0) {
      for (const f of files) {
        const mime = f.mimetype.split('/')[0];
        if (mime === 'image') images.push(`/uploads/tmp/${f.filename}`);
        else if (mime === 'video') videos.push(`/uploads/tmp/${f.filename}`);
      }
    }

    // ✅ Normaliza arrays si vienen como string desde frontend
    if (typeof body.images === 'string') body.images = [body.images];
    if (typeof body.videos === 'string') body.videos = [body.videos];

    // ✅ Une archivos subidos con arrays existentes
    body.images = [...(body.images ?? []), ...images];
    body.videos = [...(body.videos ?? []), ...videos];

    const owner = this.ownerFromReq(req);
    const companyIdFromBody =
      body?.companyId ?? body?.empresaId ?? body?.company_id ?? undefined;

    return this.svc.create(body, {
      userId: companyIdFromBody ? undefined : owner.userId,
      companyId: companyIdFromBody ? Number(companyIdFromBody) : owner.companyId,
    });
  }

  // ===============================================================
  // ✏️ Actualizar propiedad con soporte multimedia
  // ===============================================================
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: path.join(process.cwd(), 'uploads/tmp'),
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${Date.now()}-${file.fieldname}${ext}`);
        },
      }),
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (!body) throw new BadRequestException('Body vacío');

    const images: string[] = [];
    const videos: string[] = [];

    if (files && files.length > 0) {
      for (const f of files) {
        const mime = f.mimetype.split('/')[0];
        if (mime === 'image') images.push(`/uploads/tmp/${f.filename}`);
        else if (mime === 'video') videos.push(`/uploads/tmp/${f.filename}`);
      }
    }

    if (typeof body.images === 'string') body.images = [body.images];
    if (typeof body.videos === 'string') body.videos = [body.videos];

    body.images = [...(body.images ?? []), ...images];
    body.videos = [...(body.videos ?? []), ...videos];

    return this.svc.update(id, body);
  }

  // ===============================================================
  // 🗑️ Eliminar propiedad
  // ===============================================================
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  // ===============================================================
  // 👤 Asignar dueño
  // ===============================================================
  @UseGuards(JwtAuthGuard)
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
