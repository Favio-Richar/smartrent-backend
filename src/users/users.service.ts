// ===============================================================
// 🧩 USERS SERVICE – SmartRent+ (Versión Final Completísima)
// ===============================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================
  // Convertir nivel → Rol
  // ===========================================================
  private mapNivelToRol(nivel: string): string {
    const p = (nivel ?? '').toLowerCase();

    if (p.includes('premium')) return 'premium';
    if (p.includes('advance') || p.includes('avanzado')) return 'advance';
    if (p.includes('pro')) return 'pro';

    return 'Usuario';
  }

  // ===========================================================
  // Obtener usuario por ID
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
        portada: true,
        bio: true,
        facebook: true,
        instagram: true,
        linkedin: true,
        web: true,
        whatsapp: true,

        // CONFIGURACIÓN
        darkMode: true,
        animacionesPerfil: true,
        mostrarPortada: true,
        estiloTarjetas: true,
        colorTema: true,
        fontSize: true,
        perfilPrivado: true,
        mostrarRedes: true,
        mostrarContacto: true,
      },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

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
  // Actualizar perfil COMPLETO
  // ===========================================================
  async updateUser(id: number, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const newNivel = data.suscripcionNivel ?? user.suscripcionNivel;
    const newRol = this.mapNivelToRol(newNivel);

    return this.prisma.user.update({
      where: { id },
      data: {
        nombre: data.nombre ?? user.nombre,
        telefono: data.telefono ?? user.telefono,
        ciudad: data.ciudad ?? user.ciudad,
        bio: data.bio ?? user.bio,

        // REDES SOCIALES
        facebook: data.facebook ?? user.facebook,
        instagram: data.instagram ?? user.instagram,
        linkedin: data.linkedin ?? user.linkedin,
        web: data.web ?? user.web,
        whatsapp: data.whatsapp ?? user.whatsapp,

        // IMAGEN + PORTADA
        imagen: data.imagen ?? user.imagen,
        portada: data.portada ?? user.portada,

        // CONFIGURACIÓN DE PERFIL
        darkMode: data.darkMode ?? user.darkMode,
        animacionesPerfil: data.animacionesPerfil ?? user.animacionesPerfil,
        mostrarPortada: data.mostrarPortada ?? user.mostrarPortada,
        estiloTarjetas: data.estiloTarjetas ?? user.estiloTarjetas,
        colorTema: data.colorTema ?? user.colorTema,
        fontSize: data.fontSize ?? user.fontSize,

        perfilPrivado: data.perfilPrivado ?? user.perfilPrivado,
        mostrarRedes: data.mostrarRedes ?? user.mostrarRedes,
        mostrarContacto: data.mostrarContacto ?? user.mostrarContacto,

        suscripcionNivel: newNivel,
        tipoCuenta: newRol,
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
        portada: true,
        bio: true,
        facebook: true,
        instagram: true,
        linkedin: true,
        web: true,
        whatsapp: true,

        // CONFIGURACIÓN
        darkMode: true,
        animacionesPerfil: true,
        mostrarPortada: true,
        estiloTarjetas: true,
        colorTema: true,
        fontSize: true,
        perfilPrivado: true,
        mostrarRedes: true,
        mostrarContacto: true,
      },
    });
  }

  // ===========================================================
  // Actualizar SOLO la imagen
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
        portada: true,
        suscripcionNivel: true,
        tipoCuenta: true,
      },
    });
  }
}
