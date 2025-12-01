import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificacionesService } from 'src/notificaciones/notificaciones.service';

@Injectable()
export class SupportService {
  constructor(
    private prisma: PrismaService,
    private noti: NotificacionesService,   // ✅ INYECTAR SERVICIO DE NOTIFICACIONES
  ) {}

  // =====================================================
  // 🔹 FAQs
  // =====================================================
  async getFaqs() {
    const faqs = await this.prisma.faq.findMany({ orderBy: { id: 'asc' } });
    if (faqs.length > 0)
      return faqs.map(f => ({ question: f.question, answer: f.answer }));

    return [
      { question: 'No puedo iniciar sesión', answer: 'Verifica tu correo y contraseña.' },
      { question: 'Problemas con el pago', answer: 'Asegúrate de que tu tarjeta esté activa.' },
      { question: 'Error al subir fotos', answer: 'Las imágenes deben ser menores a 2 MB.' },
      { question: 'No me llega el código SMS', answer: 'Verifica tu número y vuelve a intentar.' },
    ];
  }

  // =====================================================
  // 🔹 CREAR TICKET
  // =====================================================
  async createTicket(data: any) {
    const imageData = data.imageBase64 ?? (data.imageUrl ? data.imageUrl : null);

    const documentData = data.documentBase64 ?? null;
    const documentName = data.documentName ?? null;

    const ticket = await this.prisma.supportTicket.create({
      data: {
        subject: data.subject?.trim() || 'Sin asunto',
        description: data.description?.trim() || 'Sin descripción',
        category: data.category || 'General',
        imageBase64: imageData,
        documentBase64: documentData,
        documentName: documentName,
        status: data.status || 'Pendiente',
        respuesta: data.respuesta || '',
        userId: data.userId || null,
      },
    });

    // 🔔 NOTIFICACIÓN AUTOMÁTICA
    if (ticket.userId) {
      await this.noti.crearNotificacion(
        ticket.userId,
        "Tu ticket fue recibido",
        `Hemos recibido tu ticket: ${ticket.subject}. Nuestro equipo lo revisará.`,
        ticket.id
      );
    }

    return { success: true, message: 'Ticket creado exitosamente', ticket };
  }

  // =====================================================
  // 🔹 OBTENER TODOS LOS TICKETS
  // =====================================================
  async getAllTickets() {
    const tickets = await this.prisma.supportTicket.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        user: { select: { id: true, nombre: true, correo: true, imagen: true } },
      },
    });

    return tickets.map(t => ({
      ...t,
      imageBase64: t.imageBase64
        ? (t.imageBase64.startsWith('data:image')
            ? t.imageBase64
            : `data:image/png;base64,${t.imageBase64}`)
        : null,
      documentBase64: t.documentBase64 ?? null,
      documentName: t.documentName ?? null,
    }));
  }

  // =====================================================
  // 🔹 TICKETS POR USUARIO
  // =====================================================
  async getTicketsByUser(userId: number) {
    return await this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // =====================================================
  // 🔹 ACTUALIZAR TICKET
  // =====================================================
  async updateTicket(id: number, data: any) {
    const existing = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ticket no encontrado');

    const updated = await this.prisma.supportTicket.update({
      where: { id },
      data: {
        status: data.status || existing.status,
        respuesta: data.respuesta ?? existing.respuesta,
      },
    });

    // 🔔 NOTIFICACIÓN
    if (existing.userId) {
      await this.noti.crearNotificacion(
        existing.userId,
        `Actualización del ticket #${id}`,
        `El estado del ticket cambió a: ${data.status}`,
        id
      );
    }

    return { success: true, message: 'Ticket actualizado correctamente', updated };
  }

  // =====================================================
  // 🔹 RESPONDER TICKET
  // =====================================================
  async replyTicket(id: number, respuesta: string) {
    const existing = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ticket no encontrado');

    const updated = await this.prisma.supportTicket.update({
      where: { id },
      data: { respuesta, status: 'En proceso' },
    });

    // 🔔 NOTIFICACIÓN
    if (existing.userId) {
      await this.noti.crearNotificacion(
        existing.userId,
        `Respuesta a tu ticket #${id}`,
        respuesta,
        id
      );
    }

    return { success: true, message: 'Respuesta enviada', updated };
  }

  // =====================================================
  // 🔹 RESOLVER TICKET
  // =====================================================
  async resolveTicket(id: number) {
    const existing = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ticket no encontrado');

    const updated = await this.prisma.supportTicket.update({
      where: { id },
      data: { status: 'Resuelto' },
    });

    // 🔔 NOTIFICACIÓN
    if (existing.userId) {
      await this.noti.crearNotificacion(
        existing.userId,
        `Ticket #${id} resuelto`,
        "Tu ticket ha sido marcado como RESUELTO.",
        id
      );
    }

    return { success: true, message: 'Ticket resuelto', updated };
  }

  // =====================================================
  // 🔹 ELIMINAR TICKET
  // =====================================================
  async deleteTicket(id: number) {
    const existing = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ticket no encontrado');

    await this.prisma.supportTicket.delete({ where: { id } });

    return { success: true, message: 'Ticket eliminado correctamente' };
  }

  // =====================================================
  // 🔹 FEEDBACK
  // =====================================================
  async createFeedback(data: any) {
    const rating = Number(data.rating);
    if (isNaN(rating) || rating < 1 || rating > 5)
      throw new Error('La calificación debe estar entre 1 y 5');

    const feedback = await this.prisma.feedback.create({
      data: {
        rating,
        comment: data.comment || '',
        respuesta: data.respuesta || null,
        userId: data.userId || null,
      },
    });

    return { success: true, message: 'Feedback registrado correctamente', feedback };
  }

  async getAllFeedback() {
    return await this.prisma.feedback.findMany({
      include: {
        user: { select: { id: true, nombre: true, correo: true, imagen: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateFeedback(id: number, data: any) {
    const existing = await this.prisma.feedback.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Reseña no encontrada');

    const updated = await this.prisma.feedback.update({
      where: { id },
      data: { respuesta: data.respuesta || null },
    });

    return { success: true, message: 'Respuesta agregada correctamente', updated };
  }

  async getFeedbackStats() {
    const [avg, count, ratings] = await Promise.all([
      this.prisma.feedback.aggregate({ _avg: { rating: true } }),
      this.prisma.feedback.count(),
      this.prisma.feedback.groupBy({
        by: ['rating'],
        _count: { rating: true },
        orderBy: { rating: 'asc' },
      }),
    ]);

    return {
      averageRating: Number(avg._avg.rating?.toFixed(1)) || 0,
      totalFeedbacks: count,
      ratingBreakdown: ratings.map(r => ({
        stars: r.rating,
        count: r._count.rating,
      })),
    };
  }

  // =====================================================
  // 🔹 Comunidad
  // =====================================================
  async getCommunityPosts() {
    return await this.prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async createCommunityPost(data: any) {
    if (!data.title || !data.body) throw new Error('Faltan campos requeridos');

    const post = await this.prisma.communityPost.create({
      data: {
        author: data.author || 'Anónimo',
        title: data.title.trim(),
        body: data.body.trim(),
      },
    });

    return { success: true, message: 'Publicación creada correctamente', post };
  }
}
