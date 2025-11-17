import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: (process.env.SMTP_PORT || '') === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // ===========================================================
  // 🔹 Control global: si DISABLE_EMAIL=true el correo NO se envía
  // ===========================================================
  private skipEmailIfDisabled() {
    if (process.env.DISABLE_EMAIL === 'true') {
      this.logger.warn('📨 Envío de correo DESHABILITADO en modo desarrollo.');
      return true;
    }
    return false;
  }

  // ===========================================================
  // 🔹 Envío genérico de correo
  // ===========================================================
  async send(to: string, subject: string, html: string, attachments: any[] = []) {
    const from = process.env.SMTP_FROM || 'SmartRent+ <no-reply@smartrent.com>';

    // ⛔ Evita error si está deshabilitado
    if (this.skipEmailIfDisabled()) return;

    // ⛔ Si faltan credenciales no intentar enviar
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.warn('⚠️ SMTP no configurado correctamente. Se omitió el envío.');
      return;
    }

    await this.transporter.sendMail({
      from,
      to,
      subject,
      html,
      attachments,
    });

    this.logger.log(`📨 Correo enviado: ${subject} → ${to}`);
  }

  // ===========================================================
  // 🔹 Envío BOLETA PDF
  // ===========================================================
  async sendInvoiceEmail(
    to: string,
    pdfPath: string,
    meta: {
      monto: number;
      plan: string;
      codigo: string;
      fecha: Date;
    },
  ) {
    const subject = `📄 Boleta de Suscripción - ${meta.plan}`;

    const html = `
      <div style="font-family: Arial; max-width:600px; margin:0 auto;">
        <h2 style="color:#005CEE;">SmartRent+ • Confirmación de pago</h2>
        <p>Tu suscripción al plan <strong>${meta.plan}</strong> fue procesada.</p>

        <ul>
          <li><strong>Monto:</strong> $${meta.monto}</li>
          <li><strong>Código autorización:</strong> ${meta.codigo}</li>
          <li><strong>Fecha:</strong> ${meta.fecha}</li>
        </ul>

        <p>Tu boleta viene adjunta en PDF.</p>
      </div>
    `;

    return this.send(to, subject, html, [
      {
        filename: 'boleta.pdf',
        path: pdfPath,
      },
    ]);
  }

  // ===========================================================
  // 🔹 Reset password
  // ===========================================================
  async sendResetPassword(to: string, code: string, resetLink: string) {
    const subject = 'Recuperación de contraseña - SmartRent+';
    const html = this.passwordTemplate(code, resetLink);
    return this.send(to, subject, html);
  }

  private passwordTemplate(code: string, link: string) {
    return `
      <div style="font-family: Arial;">
        <h2>SmartRent+ – Recuperación de contraseña</h2>
        <p>Tu código es: <strong>${code}</strong></p>
        <p>O haz clic aquí:</p>
        <a href="${link}">Restablecer contraseña</a>
      </div>
    `;
  }
}
