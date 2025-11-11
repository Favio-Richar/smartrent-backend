import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // =====================================================
  // 🔹 FAQs (Preguntas Frecuentes)
  // =====================================================
  @Get('faqs')
  async getFaqs() {
    try {
      return await this.supportService.getFaqs();
    } catch (e: any) {
      throw new HttpException(
        e?.message || 'Error interno',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // 🔹 Crear un ticket
  // =====================================================
  @Post('tickets')
  async createTicket(@Body() body: any) {
    try {
      return await this.supportService.createTicket(body);
    } catch (e: any) {
      throw new HttpException(
        e?.message || 'Error creando ticket',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // 🔹 Obtener todos los tickets (Admin)
  // =====================================================
  @Get('tickets')
  async getAllTickets() {
    try {
      return await this.supportService.getAllTickets();
    } catch (e: any) {
      throw new HttpException(
        e?.message || 'Error obteniendo tickets',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // 🔹 Obtener tickets por usuario
  // =====================================================
  @Get('tickets/:userId')
  async getTicketsByUser(@Param('userId') userId: string) {
    try {
      return await this.supportService.getTicketsByUser(Number(userId));
    } catch (e: any) {
      throw new HttpException(
        e?.message || 'Error obteniendo tickets de usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // 🔹 Actualizar ticket (estado o respuesta)
  // =====================================================
  @Put('tickets/:id')
  async updateTicket(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.supportService.updateTicket(Number(id), body);
    } catch (e: any) {
      throw new HttpException(
        e?.message || 'Error actualizando ticket',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // 🔹 Responder ticket (Admin)
  // =====================================================
  @Post('tickets/:id/reply')
  async replyTicket(
    @Param('id') id: string,
    @Body('respuesta') respuesta: string,
  ) {
    try {
      return await this.supportService.replyTicket(Number(id), respuesta);
    } catch (e: any) {
      throw new HttpException(
        e?.message || 'Error respondiendo ticket',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // 🔹 Resolver ticket
  // =====================================================
  @Patch('tickets/:id/resolve')
  async resolveTicket(@Param('id') id: string) {
    try {
      return await this.supportService.resolveTicket(Number(id));
    } catch (e: any) {
      throw new HttpException(
        e?.message || 'Error resolviendo ticket',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // 🔹 Eliminar ticket
  // =====================================================
  @Delete('tickets/:id')
  async deleteTicket(@Param('id') id: string) {
    try {
      return await this.supportService.deleteTicket(Number(id));
    } catch (e: any) {
      throw new HttpException(
        e?.message || 'Error eliminando ticket',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // 🔹 Crear feedback o reseña
  // =====================================================
  @Post('feedback')
  async createFeedback(@Body() body: any) {
    try {
      return await this.supportService.createFeedback(body);
    } catch (e: any) {
      throw new HttpException(
        e?.message || 'Error enviando feedback',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // 🔹 Obtener TODAS las reseñas (Admin)
  // =====================================================
  @Get('feedback')
  async getAllFeedback() {
    try {
      return await this.supportService.getAllFeedback();
    } catch (e: any) {
      throw new HttpException(
        e?.message || 'Error obteniendo reseñas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // 🔹 Actualizar o responder reseña
  // =====================================================
  @Put('feedback/:id')
  async updateFeedback(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.supportService.updateFeedback(Number(id), body);
    } catch (e: any) {
      throw new HttpException(
        e?.message || 'Error actualizando feedback',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // 🔹 Obtener estadísticas de feedback
  // =====================================================
  @Get('feedback/stats')
  async getFeedbackStats() {
    try {
      return await this.supportService.getFeedbackStats();
    } catch (e: any) {
      throw new HttpException(
        e?.message || 'Error obteniendo estadísticas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // 🔹 Listar publicaciones comunidad
  // =====================================================
  @Get('community')
  async getCommunityPosts() {
    try {
      return await this.supportService.getCommunityPosts();
    } catch (e: any) {
      throw new HttpException(
        e?.message || 'Error obteniendo publicaciones',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // 🔹 Crear nueva publicación comunidad
  // =====================================================
  @Post('community')
  async createCommunityPost(@Body() body: any) {
    try {
      return await this.supportService.createCommunityPost(body);
    } catch (e: any) {
      throw new HttpException(
        e?.message || 'Error creando publicación',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
