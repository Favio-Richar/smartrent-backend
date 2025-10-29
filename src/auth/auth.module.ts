// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerModule } from '../mailer/mailer.module'; // 👈 importar el mailer

@Module({
  imports: [
    PrismaModule,
    MailerModule, // 👈 habilita MailerService vía DI en AuthService
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], // (opcional) si otro módulo necesita AuthService
})
export class AuthModule {}
