import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // CREAR EMPRESA
  // ============================================================
  async create(data: any) {
    // Normaliza valores vacíos
    Object.keys(data).forEach((k) => {
      if (data[k] === '' || data[k] === undefined) data[k] = null;
    });

    // 🔥 FIX 1 → Flutter envía array en registro
    if (Array.isArray(data.diasOperacion)) {
      data.diasOperacion = data.diasOperacion.join(',');
    }

    return this.prisma.company.create({
      data: {
        ...data,
        userId: data.userId ?? null,
      },
    });
  }

  // ============================================================
  // GET ALL
  // ============================================================
  async findAll() {
    return this.prisma.company.findMany();
  }

  // ============================================================
  // GET ONE
  // ============================================================
  async findOne(id: number) {
    return this.prisma.company.findUnique({ where: { id } });
  }

  // ============================================================
  // GET BY USER
  // ============================================================
  async findByUser(userId: number) {
    return this.prisma.company.findFirst({ where: { userId } });
  }

  // ============================================================
  // GUARDAR LOGO (FUNCIONA)
  // ============================================================
  private async saveFile(file: Express.Multer.File, id: number) {
    const dir = 'uploads/companies';

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `company_${id}_${Date.now()}.jpg`;
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, file.buffer);

    return `${process.env.PUBLIC_BASE_URL}/${filepath.replace(/\\/g, '/')}`;
  }

  // ============================================================
  // UPDATE EMPRESA (JSON + MULTIPART)
  // ============================================================
  async update(id: number, data: any, file?: Express.Multer.File) {
    // Normalizar vacíos
    Object.keys(data).forEach((k) => {
      if (data[k] === '' || data[k] === undefined) data[k] = null;
    });

    // 🔥 FIX 2 → Flutter envía array en edición también
    if (Array.isArray(data.diasOperacion)) {
      data.diasOperacion = data.diasOperacion.join(',');
    }

    // Logo
    let logoUrl: string | null = null;
    if (file) {
      logoUrl = await this.saveFile(file, id);
    }

    return this.prisma.company.update({
      where: { id },
      data: {
        ...data,
        logo: logoUrl ?? data.logo ?? null,
      },
    });
  }

  // ============================================================
  // DELETE
  // ============================================================
  async remove(id: number) {
    return this.prisma.company.delete({ where: { id } });
  }
}
