// ===============================================================
// 🧩 USERS SERVICE – SmartRent+ (Versión Final Roles + Suscripciones)
// ---------------------------------------------------------------
// 🔥 Incluye:
// - Obtener usuario con nivel de suscripción
// - Actualizar perfil + sincronizar rol automáticamente
// - Actualizar imagen
// - Sincronizar tipoCuenta según suscripcionNivel
// ---------------------------------------------------------------
// ===============================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================
  // 🔹 Convertir nivel → Tipo de Cuenta (ROL)
  // ===========================================================
  private mapNivelToRol(nivel: string): string {
    const p = (nivel ?? '').toLowerCase();

    if (p.includes('premium')) return 'premium';
    if (p.includes('advance') || p.includes('avanzado')) return 'advance';
    if (p.includes('pro')) return 'pro';

    return 'Usuario';
  }

  // ===========================================================
  // 🔹 Obtener usuario por ID (incluye nivel y rol)
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
        suscripcionNivel: true,
        imagen: true,
        bio: true,
        facebook: true,
        instagram: true,
        linkedin: true,
        web: true,
      },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    // 🔥 Sincronizar automáticamente el rol si está incorrecto
    const rolCorrecto = this.mapNivelToRol(user.suscripcionNivel);

    if (user.tipoCuenta !== rolCorrecto) {
      await this.prisma.user.update({
        where: { id },
        data: { tipoCuenta: rolCorrecto },
      });

      user.tipoCuenta = rolCorrecto;
    }

    return user;
  }

  // ===========================================================
  // 🔹 Actualizar perfil (incluye nivel + rol)
  // ===========================================================
  async updateUser(id: number, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // 🔥 Si se cambia el nivel, actualizar tipoCuenta automáticamente
    const newNivel = data.suscripcionNivel ?? user.suscripcionNivel;
    const newRol = this.mapNivelToRol(newNivel);

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
        web: data.web,
        imagen: data.imagen,

        suscripcionNivel: newNivel,
        tipoCuenta: newRol, // 🔥 ACTUALIZADO AUTOMÁTICAMENTE
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        telefono: true,
        ciudad: true,
        tipoCuenta: true,
        suscripcionNivel: true,
        imagen: true,
        bio: true,
        facebook: true,
        instagram: true,
        linkedin: true,
        web: true,
      },
    });
  }

  // ===========================================================
  // 🔹 Actualizar SOLO imagen
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
        suscripcionNivel: true,
        tipoCuenta: true,
      },
    });
  }
}
