import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async generateInvoice(paymentId: number) {
    const payment = await this.prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) {
      throw new HttpException('Pago no encontrado', HttpStatus.NOT_FOUND);
    }

    const dir = path.join(process.cwd(), 'public', 'invoices');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const fileName = `invoice_${payment.id}.pdf`;
    const filePath = path.join(dir, fileName);

    const pdf = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    pdf.pipe(stream);

    pdf.fontSize(20).text('SmartRent+ - Boleta de Suscripción', { align: 'center' });
    pdf.moveDown();

    pdf.fontSize(12).text(`Usuario: ${payment.user.nombre}`);
    pdf.text(`Correo: ${payment.user.correo}`);
    pdf.text(`Plan: ${payment.plan}`);
    pdf.text(`Monto: $${payment.amount}`);
    pdf.text(`Autorización: ${payment.authorizationCode ?? '-'}`);
    pdf.text(`Últimos 4 dígitos: ${payment.cardLast4 ?? '----'}`);
    pdf.text(`Fecha: ${new Date().toLocaleString()}`);

    pdf.end();

    await new Promise<void>((resolve) => {
      stream.on('finish', () => resolve());
    });

    return await this.prisma.invoice.create({
      data: {
        userId: payment.userId,
        paymentId: payment.id,
        pdfUrl: `/public/invoices/${fileName}`,
        amount: payment.amount,
        plan: payment.plan,
        authorizationCode: payment.authorizationCode,
        last4: payment.cardLast4,
      },
    });
  }

  async getInvoicesByUser(userId: number) {
    return this.prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvoiceById(id: number) {
    return this.prisma.invoice.findUnique({
      where: { id },
    });
  }
}
