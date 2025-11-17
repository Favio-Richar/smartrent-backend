// ===============================================================
// 📄 INVOICE CONTROLLER – SmartRent+
// ---------------------------------------------------------------
// 🔹 Listar boletas por usuario
// 🔹 Descargar PDF
// 🔹 Enviar boleta por correo
// ===============================================================

import {
  Controller,
  Get,
  Param,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { MailerService } from '../mailer/mailer.service';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly mailer: MailerService,
  ) {}

  // ============================================================
  // 🔹 Obtener boletas por usuario
  // GET /invoice/user/5
  // ============================================================
  @Get('user/:id')
  async getUserInvoices(@Param('id') id: string) {
    return this.invoiceService.getInvoicesByUser(Number(id));
  }

  // ============================================================
  // 🔹 Descargar boleta PDF
  // GET /invoice/download/10
  // ============================================================
  @Get('download/:id')
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const invoice = await this.invoiceService.getInvoiceById(Number(id));

    if (!invoice) {
      throw new HttpException('Boleta no encontrada', HttpStatus.NOT_FOUND);
    }

    const filePath = path.join(process.cwd(), invoice.pdfUrl);

    if (!fs.existsSync(filePath)) {
      throw new HttpException(
        'Archivo PDF no existe en el servidor',
        HttpStatus.NOT_FOUND,
      );
    }

    return res.download(filePath);
  }

  // ============================================================
  // 🔹 ENVIAR BOLETA POR CORREO
  // GET /invoice/send/10/email@gmail.com
  // ============================================================
  @Get('send/:invoiceId/:email')
  async sendInvoiceEmail(
    @Param('invoiceId') invoiceId: string,
    @Param('email') email: string,
  ) {
    const invoice = await this.invoiceService.getInvoiceById(Number(invoiceId));

    if (!invoice) {
      throw new HttpException('Boleta no encontrada', HttpStatus.NOT_FOUND);
    }

    const filePath = path.join(process.cwd(), invoice.pdfUrl);

    if (!fs.existsSync(filePath)) {
      throw new HttpException(
        'Archivo PDF no existe en el servidor',
        HttpStatus.NOT_FOUND,
      );
    }

    // 🔥 ENVIAR CORREO
    await this.mailer.sendInvoiceEmail(email, filePath, {
      monto: invoice.amount,
      plan: invoice.plan,
      codigo: invoice.authorizationCode ?? '-',
      fecha: invoice.createdAt,
    });

    return {
      success: true,
      message: `Boleta enviada correctamente al correo ${email}`,
    };
  }
}
