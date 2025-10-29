import {
  Controller,
  Get,
  Put,
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
  // 🔹 Actualizar usuario
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
      throw new BadRequestException('Error al actualizar el perfil');
    }
  }
}
