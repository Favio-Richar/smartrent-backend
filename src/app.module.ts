import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

// ====== Módulos principales ======
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { PropertiesModule } from './properties/properties.module';
import { JobsModule } from './jobs/jobs.module';
import { SalesModule } from './sales/sales.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AdminModule } from './admin/admin.module';
import { SupportModule } from './support/support.module';
import { UploadsModule } from './uploads/uploads.module';
import { ReservationsModule } from './reservations/reservations.module';

// ✅ Nuevo módulo de estadísticas
import { EstadisticasModule } from './estadisticas/estadisticas.module';

// ✅ Nuevo módulo de pagos (Webpay / Transbank)
import { PaymentsModule } from './subscriptions/payments.module';

@Module({
  imports: [
    // ========= 📂 SERVIR ARCHIVOS ESTÁTICOS =========
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public',
    }),

    // ========= 🔑 MÓDULOS FUNCIONALES PRINCIPALES =========
    AuthModule,
    UsersModule,
    CompaniesModule,
    PropertiesModule,
    JobsModule,
    SalesModule,
    SubscriptionsModule,
    AdminModule,
    SupportModule,
    UploadsModule,
    ReservationsModule,
    EstadisticasModule,

    // ========= 💳 MÓDULO DE PAGOS WEBPAY =========
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
