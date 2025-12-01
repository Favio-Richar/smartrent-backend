// ===============================================================
// 🚀 APP MODULE – SmartRent+ Backend (Versión Final Actualizada)
// ===============================================================

import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';

// ====== Controladores raíz ======
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

// ====== Módulos existentes ======
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

// ⭐⭐⭐ PUBLICACIONES ADMIN
import { AdminPublicacionesModule } from './admin-publicaciones/admin-publicaciones.module';

// ⭐⭐⭐ NOTIFICACIONES (🔥 NUEVO)
import { NotificacionesModule } from './notificaciones/notificaciones.module';

// ⭐⭐⭐ VENTAS
import { VentasModule } from './ventas/ventas.module';

// ⭐⭐⭐ NUEVO — ESTADÍSTICAS DE VENTAS
import { EstadisticasVentasModule } from './estadisticas-ventas/estadisticas-ventas.module';

@Module({
  imports: [
    // ================================================
    // 🌍 Configuración global
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
     ServeStaticModule.forRoot({
  rootPath: join(process.cwd(), 'uploads/ventas'),
  serveRoot: '/uploads/ventas',
}),

    // ================================================
    // 🔑 Módulos principales
    // ================================================
    VentasModule,
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

    // 📊 Estadísticas de ARRIENDOS
    EstadisticasModule,

    // 📊📦🔥 Estadísticas de VENTAS (NUEVO)
    EstadisticasVentasModule,

    InvoiceModule,
    SubscriptionsModule,

    // ⭐ Módulos sociales y de interacción
    ComentariosModule,
    ProfilePostModule,
    AdminPublicacionesModule,

    // ⭐⭐⭐ AÑADIDO — Módulo de Notificaciones
    NotificacionesModule,
  ],

  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
