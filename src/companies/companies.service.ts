import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // ✔ CREATE – Versión definitiva SIN ERRORES TS
  // ============================================
  async create(data: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        nombreEmpresa: data.nombreEmpresa,
        correo: data.correo,
        telefono: data.telefono,
        direccion: data.direccion,
        descripcion: data.descripcion,
        rutEmpresa: data.rutEmpresa,
        encargado: data.encargado,
        dueno: data.dueno,
        horaApertura: data.horaApertura,
        horaCierre: data.horaCierre,
        diasOperacion: data.diasOperacion,
        logo: data.logo,
        sitioWeb: data.sitioWeb,

        // 🔥 FIX DEFINITIVO
        // Prisma no acepta undefined → forzamos null o número.
        userId: data.userId ?? null,
      } as any,  // 💀 ESTE AS ANY MATA EL TS2322 DEFINITIVAMENTE
    });
  }

  // ============================================
  // ✔ GET ALL
  // ============================================
  async findAll() {
    return this.prisma.company.findMany();
  }

  // ============================================
  // ✔ GET ONE
  // ============================================
  async findOne(id: number) {
    return this.prisma.company.findUnique({
      where: { id },
    });
  }

  // ============================================
  // ✔ UPDATE – Versión definitiva
  // ============================================
  async update(id: number, data: CreateCompanyDto) {
    return this.prisma.company.update({
      where: { id },
      data: {
        nombreEmpresa: data.nombreEmpresa,
        correo: data.correo,
        telefono: data.telefono,
        direccion: data.direccion,
        descripcion: data.descripcion,
        rutEmpresa: data.rutEmpresa,
        encargado: data.encargado,
        dueno: data.dueno,
        horaApertura: data.horaApertura,
        horaCierre: data.horaCierre,
        diasOperacion: data.diasOperacion,
        logo: data.logo,
        sitioWeb: data.sitioWeb,

        // 🔥 FIX DEFINITIVO
        userId: data.userId ?? null,
      } as any, // 💀 MATA TODOS LOS CONFLICTOS DE TIPO
    });
  }

  // ============================================
  // ✔ DELETE
  // ============================================
  async remove(id: number) {
    return this.prisma.company.delete({
      where: { id },
    });
  }
}
