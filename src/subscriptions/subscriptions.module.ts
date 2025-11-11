import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PaymentsModule } from './payments.module'; // ✅ mismo nivel de carpeta

@Module({
  imports: [PaymentsModule], // ✅ importar el módulo de pagos
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
