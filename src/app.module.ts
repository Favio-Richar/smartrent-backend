import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 🔹 Módulos funcionales
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { PropertiesModule } from './properties/properties.module';
import { JobsModule } from './jobs/jobs.module';
import { SalesModule } from './sales/sales.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AdminModule } from './admin/admin.module';
import { SupportModule } from './support/support.module';

// 🔹 Prisma Service (conexión central a la BD)
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CompaniesModule,
    PropertiesModule,
    JobsModule,
    SalesModule,
    SubscriptionsModule,
    AdminModule,
    SupportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService, // ✅ agregado para habilitar Prisma globalmente
  ],
})
export class AppModule {}
