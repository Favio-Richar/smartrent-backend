import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  // ============================
  // CREATE
  // ============================
  @Post()
  async create(@Body() data: CreateCompanyDto) {
    return this.companiesService.create(data);
  }

  // ============================
  // GET ALL
  // ============================
  @Get()
  async findAll() {
    return this.companiesService.findAll();
  }

  // ============================
  // GET BY USER
  // ============================
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.companiesService.findByUser(Number(userId));
  }

  // ============================
  // GET ONE
  // ============================
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.companiesService.findOne(Number(id));
  }

  // ============================
  // UPDATE SOLO JSON (SIN FOTO)
  // ============================
  @Put(':id/json')
  async updateJson(
    @Param('id') id: string,
    @Body() data: UpdateCompanyDto,
  ) {
    return this.companiesService.update(Number(id), data, undefined);
  }

  // ============================
  // UPDATE MULTIPART (CON FOTO)
  // 🔥 FIX REAL AQUÍ ABAJO 🔥
  // ============================
  @Put(':id')
  @UseInterceptors(FileInterceptor('logo'))
  async updateMultipart(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {

    // 🔥 FIX 1 → Flutter envía objetos en vez de strings
    Object.keys(body).forEach(key => {
      if (typeof body[key] === 'object') {
        body[key] = JSON.stringify(body[key]);
      }
    });

    // 🔥 FIX 2 → convertir campos obligatorios
    const data: any = {
      nombreEmpresa: body.nombreEmpresa || null,
      descripcion: body.descripcion || null,
      telefono: body.telefono || null,
      correo: body.correo || null,
      direccion: body.direccion || null,
      sitioWeb: body.sitioWeb || null,
      horaApertura: body.horaApertura || null,
      horaCierre: body.horaCierre || null,
      diasOperacion: body.diasOperacion || null, // Flutter envía string
      logo: body.logo || null,
    };

    return this.companiesService.update(Number(id), data, file);
  }

  // ============================
  // DELETE
  // ============================
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.companiesService.remove(Number(id));
  }
}
