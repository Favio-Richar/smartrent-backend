// ===============================================================
// 🚀 APP MODULE – SmartRent+ Backend (Versión Final Actualizada)
// ---------------------------------------------------------------
// 🔥 Compatible con WebPay (sandbox + producción)
// 🔥 Maneja archvos PDF / boletas en /public
// 🔥 Configuración global .env mejorada
// 🔥 Listo para sistema de roles por suscripción
// 🔥 NO se borró nada de tu módulo original
// ===============================================================

import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';

// ====== Controladores y servicios raíz ======
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

// ====== Módulos funcionales ======
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { PropertiesModule } from './properties/properties.module';
import { JobsModule } from './jobs/jobs.module';
import { SalesModule } from './sales/sales.module';
import { AdminModule } from './admin/admin.module';
import { SupportModule } from './support/support.module';
import { UploadsModule } from './uploads/uploads.module';
import { ReservationsModule } from './reservations/reservations.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { InvoiceModule } from './invoice/invoice.module';
@Module({
  imports: [
    // ===========================================================
    // 🌍 Configuración global (.env)
    // -----------------------------------------------------------
    // Se cargan todas las variables de entorno
    // Disponible para TODO el backend
    // ===========================================================
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      expandVariables: true, // 🔥 permite usar ${VAR} dentro de .env
    }),

    // ===========================================================
    // 📂 Archivos estáticos (uploads y public)
    // -----------------------------------------------------------
    // 🔥 Aquí irán las BOLETAS PDF generadas
    // /public/boletas/*
    // ===========================================================
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public',
    }),

    // ===========================================================
    // 🔑 Módulos funcionales principales
    // ===========================================================
    AuthModule,
    UsersModule,
    CompaniesModule,
    PropertiesModule,
    JobsModule,
    SalesModule,
    AdminModule,
    SupportModule,
    UploadsModule,
    ReservationsModule,
    EstadisticasModule,
    InvoiceModule,

    // ===========================================================
    // 💳 Módulo de suscripciones y WebPay
    // ===========================================================
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,

    // 🔥 Aquí puedes agregar providers globales luego:
    // RolesService,
    // PdfService,
  ],

  exports: [PrismaService],
})
export class AppModule {}
