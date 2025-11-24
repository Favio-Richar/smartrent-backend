import {
  Controller,
  Get,
  Put,
  Patch,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ===========================================================
  // 🔹 Obtener usuario por ID
  // ===========================================================
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(Number(id));
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // ===========================================================
  // 🔹 Actualizar perfil COMPLETO (PUT)
  // ===========================================================
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    try {
      const updated = await this.usersService.updateUser(Number(id), data);

      if (!updated) throw new NotFoundException('Usuario no encontrado');

      return {
        message: '✅ Perfil actualizado correctamente',
        user: updated,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al actualizar el perfil');
    }
  }

  // ===========================================================
  // 🔹 Actualizar SOLO la imagen de perfil (Avatar)
  // ===========================================================
  @Patch(':id/avatar')
  async updateAvatar(
    @Param('id') id: string,
    @Body('avatar') avatar: string,
  ) {
    if (!avatar) {
      throw new BadRequestException('El enlace del avatar es obligatorio');
    }

    const updated = await this.usersService.updateUser(Number(id), {
      imagen: avatar,
    });

    if (!updated) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      message: '🖼️ Avatar actualizado correctamente',
      avatar: updated.imagen,
    };
  }

  // ===========================================================
  // 🔹 Actualizar PORTADA del perfil
  // ===========================================================
  @Patch(':id/portada')
  async updateCover(
    @Param('id') id: string,
    @Body('portada') portada: string,
  ) {
    if (!portada) {
      throw new BadRequestException('El enlace de la portada es obligatorio');
    }

    const updated = await this.usersService.updateUser(Number(id), {
      portada,
    });

    if (!updated) throw new NotFoundException('Usuario no encontrado');

    return {
      message: '🖼️ Portada actualizada correctamente',
      portada,
    };
  }

  // ===========================================================
  // 🔹 Actualizar DATOS PERSONALES
  // ===========================================================
  @Patch(':id/datos')
  async updateDatos(
    @Param('id') id: string,
    @Body()
    body: {
      nombre?: string;
      telefono?: string;
      ciudad?: string;
      bio?: string;
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      web?: string;
      whatsapp?: string;
    },
  ) {
    const updated = await this.usersService.updateUser(Number(id), body);

    if (!updated) throw new NotFoundException('Usuario no encontrado');

    return {
      message: '📌 Datos personales actualizados',
      user: updated,
    };
  }

  // ===========================================================
  // ⭐ NUEVO — Actualizar CONFIGURACIÓN COMPLETA DEL PERFIL
  // ===========================================================
  @Patch(':id/config')
  async updateConfig(
    @Param('id') id: string,
    @Body()
    data: {
      // Apariencia
      darkMode?: boolean;
      animacionesPerfil?: boolean;
      mostrarPortada?: boolean;
      estiloTarjetas?: string;
      colorTema?: string;
      fontSize?: number;

      // Privacidad
      perfilPrivado?: boolean;
      mostrarRedes?: boolean;
      mostrarContacto?: boolean;

      // Redes
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      web?: string;
      whatsapp?: string;

      // Datos personales opcionales
      nombre?: string;
      telefono?: string;
      ciudad?: string;
      bio?: string;

      // Imagenes opcionales
      imagen?: string;
      portada?: string;
    },
  ) {
    try {
      const updated = await this.usersService.updateUser(Number(id), data);
      return {
        message: '⚙️ Configuración actualizada correctamente',
        user: updated,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al actualizar configuración');
    }
  }
}
