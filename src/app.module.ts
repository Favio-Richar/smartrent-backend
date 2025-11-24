// ===============================================================
// 🚀 APP MODULE – SmartRent+ Backend (Versión Final Actualizada)
// ---------------------------------------------------------------
// 🔥 Compatible con WebPay (sandbox + producción)
// 🔥 Manejo de archivos PDF / boletas en /public
// 🔥 Configuración global .env mejorada
// 🔥 Roles por suscripción activo
// 🔥 Comentarios y Perfil Social (posts, likes, comentarios)
// ===============================================================

import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';

// ====== Controladores y servicios raíz ======
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

// ====== Módulos funcionales existentes ======
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

// ⭐⭐⭐ COMENTARIOS
import { ComentariosModule } from './comentarios/comentarios.module';

// ⭐⭐⭐ PUBLICACIONES DEL PERFIL
import { ProfilePostModule } from './profile-post/profile-post.module';

// ⭐⭐⭐ NUEVO: PUBLICACIONES ADMIN (MODERACIÓN)
import { AdminPublicacionesModule } from './admin-publicaciones/admin-publicaciones.module';

@Module({
  imports: [
    // ================================================
    // 🌍 Configuración global (.env)
    // ================================================
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      expandVariables: true,
    }),

    // ================================================
    // 📂 Archivos estáticos
    // ================================================
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public',
    }),

    // ================================================
    // 🔑 Módulos principales
    // ================================================
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

    // 💳 Suscripciones
    SubscriptionsModule,

    // ⭐ Comentarios
    ComentariosModule,

    // ⭐ Publicaciones de usuario
    ProfilePostModule,

    // ⭐ Publicaciones del ADMIN (MODERACIÓN)
    AdminPublicacionesModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    PrismaService,
  ],

  exports: [PrismaService],
})
export class AppModule {}
