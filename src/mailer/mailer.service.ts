import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: (process.env.SMTP_PORT || '') === '465', // true si usas 465 (SSL)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  /**
   * Envío genérico
   */
  async send(to: string, subject: string, html: string) {
    const from = process.env.SMTP_FROM || 'SmartRent+ <no-reply@smartrent.com>';

    // Validación básica de configuración
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.warn(
        'SMTP no configurado. Define SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y SMTP_FROM en .env',
      );
      // No lanzamos error para no romper flujo en dev, pero avisamos.
      return;
    }

    await this.transporter.sendMail({ from, to, subject, html });
    this.logger.log(`Correo enviado a ${to} (${subject})`);
  }

  /**
   * Correo de restablecimiento de contraseña con código y link
   */
  async sendResetPassword(to: string, code: string, resetLink: string) {
    const subject = 'Recuperación de contraseña - SmartRent+';
    const html = this.resetPasswordTemplate(code, resetLink);
    return this.send(to, subject, html);
  }

  /**
   * HTML del correo de recuperación
   */
  private resetPasswordTemplate(code: string, link: string) {
    return `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width:600px; margin:0 auto;">
        <h2 style="color:#0066FF;">SmartRent+ • Recuperación de contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p><strong>Código de verificación:</strong></p>
        <div style="font-size:28px; font-weight:bold; letter-spacing:3px; background:#f2f4ff; padding:12px 16px; border-radius:8px; display:inline-block;">
          ${code}
        </div>
        <p style="margin-top:18px;">También puedes hacerlo con este enlace:</p>
        <p>
          <a href="${link}" style="background:#0066FF; color:#ffffff; text-decoration:none; padding:10px 14px; border-radius:8px; display:inline-block;">
            Restablecer contraseña
          </a>
        </p>
        <p style="margin-top:18px; color:#666;">
          El código y el enlace expiran en 15 minutos. Si no solicitaste este cambio, ignora este mensaje.
        </p>
        <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />
        <p style="font-size:12px; color:#999;">© ${new Date().getFullYear()} SmartRent+</p>
      </div>
    `;
  }
}
