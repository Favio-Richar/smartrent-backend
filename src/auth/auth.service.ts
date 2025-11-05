import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
    private readonly jwtService: JwtService,   // 👈 inyectamos JwtService
  ) {}

  // ---------- helpers ----------
  private normEmail(v?: string) {
    return (v || '').trim().toLowerCase();
  }
  private getEmail(body: any) {
    return this.normEmail(body?.email ?? body?.correo);
  }
  private getPassFromAny(body: any) {
    return (body?.password ?? body?.contrasena ?? '').toString().trim();
  }
  private getNewPassFromAny(body: any) {
    return (
      body?.newPassword ??
      body?.nuevaContrasena ??
      body?.password ??
      body?.contrasena ??
      ''
    ).toString().trim();
  }
  private pubUser(u: any) {
    if (!u) return null;
    const { contrasena, resetCode, resetCodeExpires, ...rest } = u;
    return rest;
  }

  // 🔐 firma JWT con el payload que la estrategia espera
  private sign(user: any) {
    const payload = {
      sub: user.id,
      email: user.correo ?? user.email ?? null,
      companyId: user.companyId ?? null, // si no usas companyId por ahora, quedará null
    };
    return this.jwtService.sign(payload);
  }

  private genCode6(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  private appPublicUrl() {
    return (
      process.env.APP_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000'
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
    if (existingUser) throw new ConflictException('El correo ya está registrado.');

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
  // FORGOT / RESET  (igual que tu versión, sin cambios funcionales)
  // ============================================================
  async forgotPassword(body: any) {
    const correo = this.getEmail(body);
    if (!correo) throw new BadRequestException('Debe enviar email/correo.');

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ correo }, { email: correo }] },
    });

    if (!user) {
      return {
        message: 'Si el correo existe, hemos enviado un código de recuperación.',
      };
    }

    const code = this.genCode6();
    const expires = new Date(Date.now() + 1000 * 60 * 15);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetCode: code, resetCodeExpires: expires },
    });

    const hasSmtp =
      !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

    if (!hasSmtp) {
      console.log(`📧 Código de recuperación para ${correo}: ${code} (15m)`);
      return {
        message: 'Token generado (modo desarrollo). Úsalo para restablecer tu contraseña.',
        dev_token: code,
      };
    }

    const appUrl = this.appPublicUrl();
    const resetUrl = `${appUrl}/reset?email=${encodeURIComponent(correo)}&token=${encodeURIComponent(code)}`;

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto">
        <h2>Recuperación de contraseña</h2>
        <p>Tu código es:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p>
        <p>También puedes usar este enlace: <a href="${resetUrl}">${resetUrl}</a></p>
      </div>
    `;
    await this.mailer.send(correo, 'SmartRent+ • Recuperación de contraseña', html);

    return { message: 'Hemos enviado un código de recuperación a tu correo.' };
  }

  async resetPassword(body: any) {
    const correo = this.getEmail(body);
    const code = (body?.code ?? body?.codigo ?? body?.token ?? '').toString().trim();
    const newPass = this.getNewPassFromAny(body);
    if (!correo || !code || !newPass) {
      throw new BadRequestException('Debe enviar correo, código y nueva contraseña.');
    }

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ correo }, { email: correo }] },
    });
    if (!user || !user.resetCode || !user.resetCodeExpires) {
      throw new UnauthorizedException('Código inválido.');
    }

    if (user.resetCode !== code || user.resetCodeExpires < new Date()) {
      throw new UnauthorizedException('Código inválido o expirado.');
    }

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { contrasena: hashed, resetCode: null, resetCodeExpires: null },
    });

    return { message: '✅ Contraseña actualizada correctamente.' };
  }
}
