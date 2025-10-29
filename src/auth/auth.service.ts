// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { MailerService } from '../mailer/mailer.service'; // 👈 inyectamos mailer

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService, // 👈 disponible si importaste MailerModule
  ) {}

  // ---------- helpers ----------
  private normEmail(v?: string) {
    return (v || '').trim().toLowerCase();
  }
  private getEmail(body: any) {
    return this.normEmail(body?.email ?? body?.correo);
  }
  private getPassFromAny(body: any) {
    // Para login/registro
    return (body?.password ?? body?.contrasena ?? '').toString().trim();
  }
  private getNewPassFromAny(body: any) {
    // Para reset
    return (
      body?.newPassword ??
      body?.nuevaContrasena ??
      body?.password ??
      body?.contrasena ??
      ''
    )
      .toString()
      .trim();
  }
  private pubUser(u: any) {
    if (!u) return null;
    const { contrasena, resetCode, resetCodeExpires, ...rest } = u;
    return rest;
  }
  private sign(user: any) {
    return jwt.sign(
      { id: user.id, correo: user.correo, tipoCuenta: user.tipoCuenta },
      process.env.JWT_SECRET || 'SmartRentPlus_Backend_JWT_KEY_2025',
      { expiresIn: '8h' },
    );
  }
  private genCode6(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  private appPublicUrl() {
    // Para armar link en el correo
    return (
      process.env.APP_URL || // e.g. https://smartrent.app
      process.env.FRONTEND_URL || // fallback
      'http://localhost:3000' // último recurso
    ).replace(/\/+$/, '');
  }

  // ============================================================
  // REGISTRO
  // ============================================================
  async register(data: any) {
    const correo = this.getEmail(data);
    const contrasena = this.getPassFromAny(data);
    const nombre = (data?.nombre || 'Usuario').toString().trim();
    const tipoCuenta = (data?.tipoCuenta || 'Usuario').toString().trim();
    const telefono = (data?.telefono || '').toString().trim();
    const ciudad = (data?.ciudad || '').toString().trim();

    if (!correo || !contrasena) {
      throw new BadRequestException('Debe ingresar correo y contraseña.');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ correo }, { email: correo }] },
    });
    if (existingUser) {
      throw new ConflictException('El correo ya está registrado.');
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const user = await this.prisma.user.create({
      data: {
        nombre,
        correo,
        email: correo,
        contrasena: hashedPassword,
        tipoCuenta,
        telefono,
        ciudad,
      },
    });

    const token = this.sign(user);

    return {
      message: '✅ Usuario registrado correctamente',
      access_token: token,
      user: this.pubUser(user),
    };
  }

  // ============================================================
  // LOGIN
  // ============================================================
  async login(data: any) {
    const correo = this.getEmail(data);
    const contrasena = this.getPassFromAny(data);

    if (!correo || !contrasena) {
      throw new BadRequestException('Debe ingresar correo y contraseña.');
    }

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ correo }, { email: correo }] },
    });

    if (!user) throw new UnauthorizedException('Usuario no encontrado.');

    const ok = await bcrypt.compare(contrasena, user.contrasena);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas.');

    // Guarda lastLogin
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = this.sign(user);

    return {
      message: '✅ Inicio de sesión exitoso',
      access_token: token,
      user: this.pubUser(user),
    };
  }

  // ============================================================
  // FORGOT PASSWORD (solicitud de código)
  // ============================================================
  async forgotPassword(body: any) {
    const correo = this.getEmail(body);
    if (!correo) throw new BadRequestException('Debe enviar email/correo.');

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ correo }, { email: correo }] },
    });

    // Siempre responder 200 para no filtrar existencia
    if (!user) {
      return {
        message:
          'Si el correo existe, hemos enviado un código de recuperación.',
      };
    }

    const code = this.genCode6();
    const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutos

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetCode: code, resetCodeExpires: expires },
    });

    const hasSmtp =
      !!process.env.SMTP_HOST &&
      !!process.env.SMTP_USER &&
      !!process.env.SMTP_PASS;

    if (hasSmtp) {
      // Email real
      const appUrl = this.appPublicUrl();
      const resetUrl = `${appUrl}/reset?email=${encodeURIComponent(
        correo,
      )}&token=${encodeURIComponent(code)}`;

      const html = `
        <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto">
          <h2>Recuperación de contraseña</h2>
          <p>Hola${user.nombre ? ` ${user.nombre}` : ''},</p>
          <p>Tu código de recuperación es:</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p>
          <p>Este código expira en <b>15 minutos</b>.</p>
          <p>Puedes pegarlo en la app o usar este enlace directo:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <hr/>
          <small>Si no solicitaste esto, ignora este correo.</small>
        </div>
      `;

      try {
        await this.mailer.send(
          correo,
          'SmartRent+ • Recuperación de contraseña',
          html,
        );
      } catch (err) {
        // Si falla SMTP, no rompemos UX: dejamos token en logs dev
        // eslint-disable-next-line no-console
        console.error('✉️ Error enviando correo:', err);
        // seguimos como dev
        return {
          message:
            'No se pudo enviar el correo, pero el código fue generado (modo desarrollo).',
          dev_token: code,
        };
      }

      return {
        message:
          'Hemos enviado un código de recuperación a tu correo (válido por 15 minutos).',
      };
    }

    // SIN SMTP -> Modo DEV: devolvemos el token para que lo uses en la app
    // eslint-disable-next-line no-console
    console.log(`📧 Código de recuperación para ${correo}: ${code} (15m)`);
    return {
      message:
        'Token generado (modo desarrollo). Úsalo para restablecer tu contraseña.',
      dev_token: code,
    };
  }

  // ============================================================
  // RESET PASSWORD (usa el código)
  // ============================================================
  async resetPassword(body: any) {
    const correo = this.getEmail(body);
    const code = (body?.code ?? body?.codigo ?? body?.token ?? '')
      .toString()
      .trim();
    const newPass = this.getNewPassFromAny(body);

    if (!correo || !code || !newPass) {
      throw new BadRequestException(
        'Debe enviar correo, código y nueva contraseña.',
      );
    }

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ correo }, { email: correo }] },
    });
    if (!user || !user.resetCode || !user.resetCodeExpires) {
      throw new UnauthorizedException('Código inválido.');
    }

    const now = new Date();
    if (user.resetCode !== code || user.resetCodeExpires < now) {
      throw new UnauthorizedException('Código inválido o expirado.');
    }

    const hashed = await bcrypt.hash(newPass, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        contrasena: hashed,
        resetCode: null,
        resetCodeExpires: null,
      },
    });

    return { message: '✅ Contraseña actualizada correctamente.' };
  }
}
