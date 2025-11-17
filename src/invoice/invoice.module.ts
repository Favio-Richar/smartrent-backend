import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [PrismaModule, MailerModule],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService], // 🔥 NECESARIO PARA PAYMENTSERVICE
})
export class InvoiceModule {}
