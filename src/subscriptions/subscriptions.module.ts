import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { PaymentsService } from './payments.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionsController],
  providers: [PaymentsService],
})
export class SubscriptionsModule {}
