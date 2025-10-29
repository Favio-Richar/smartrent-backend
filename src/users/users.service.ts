import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================
  // 🔹 Obtener usuario por ID
  // ===========================================================
  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        correo: true,
        telefono: true,
        ciudad: true,
        tipoCuenta: true,
        imagen: true,
        bio: true,
        facebook: true,
        instagram: true,
        linkedin: true,
        web: true, // 👈 CORRECTO (NO “website”)
      },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // ===========================================================
  // 🔹 Actualizar datos del perfil
  // ===========================================================
  async updateUser(id: number, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.user.update({
      where: { id },
      data: {
        nombre: data.nombre,
        telefono: data.telefono,
        ciudad: data.ciudad,
        bio: data.bio,
        facebook: data.facebook,
        instagram: data.instagram,
        linkedin: data.linkedin,
        web: data.web, // 👈 CORRECTO
        imagen: data.imagen,
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        telefono: true,
        ciudad: true,
        tipoCuenta: true,
        imagen: true,
        bio: true,
        facebook: true,
        instagram: true,
        linkedin: true,
        web: true, // 👈 CORRECTO
      },
    });
  }

  // ===========================================================
  // 🔹 Subir imagen de perfil
  // ===========================================================
  async updateUserImage(id: number, filePath: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.user.update({
      where: { id },
      data: { imagen: filePath },
      select: {
        id: true,
        nombre: true,
        imagen: true,
      },
    });
  }
}
