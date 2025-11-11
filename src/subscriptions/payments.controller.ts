// ===============================================================
// 🔹 PAYMENTS CONTROLLER – SmartRent+
// Maneja pagos Webpay (Transbank) + registro Prisma (BD real)
// ===============================================================

import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('subscriptions')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  // =============================================================
  // 🔸 Crear transacción de pago
  // =============================================================
  @Post('pay')
  async createPayment(@Body() body: any) {
    try {
      const { userId, plan } = body;
      if (!userId || !plan) {
        throw new HttpException('Faltan datos requeridos', HttpStatus.BAD_REQUEST);
      }

      // 💰 Define monto según plan
      let amount = 0;
      if (plan.toUpperCase() === 'BASIC') amount = 4990;
      else if (plan.toUpperCase() === 'PREMIUM') amount = 9990;
      else if (plan.toUpperCase() === 'PRO') amount = 14990;
      else amount = 4990; // valor por defecto

      const buyOrder = `ORD-${Date.now()}`;
      const sessionId = userId.toString();
      const returnUrl =
        this.config.get<string>('BACKEND_CONFIRM_URL') ??
        'http://10.0.2.2:3000/subscriptions/confirm';

      // 🔹 Crear transacción con Transbank
      const result = await this.paymentsService.createTransaction(
        amount,
        sessionId,
        buyOrder,
        returnUrl,
      );

      if (!result?.token || !result?.url) {
        throw new HttpException(
          'Error al generar la transacción Webpay',
          HttpStatus.BAD_GATEWAY,
        );
      }

      // 🔹 Registrar pago pendiente en la BD
      await this.paymentsService.registerPendingPayment({
        userId,
        plan,
        buyOrder,
        amount,
        token: result.token,
      });

      console.log('🕓 Transacción creada correctamente:', result.url);

      // ✅ Devuelve al frontend la URL de redirección + token_ws
      return { url: result.url, token: result.token };
    } catch (error) {
      console.error('❌ Error en createPayment:', error);
      throw new HttpException(
        error.message || 'Error interno al crear pago',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =============================================================
  // 🔸 Confirmar transacción (callback de Transbank)
  // =============================================================
  @Get('confirm')
  async confirmPayment(
    @Query('token_ws') token_ws: string,
    @Res() res: Response,
  ) {
    try {
      if (!token_ws) {
        console.error('⚠️ token_ws no recibido');
        return res.redirect(
          this.config.get<string>('FRONTEND_FAIL_URL') ??
            'http://localhost:8100/pago-fallido',
        );
      }

      const result = await this.paymentsService.commitTransaction(token_ws);
      const successUrl =
        this.config.get<string>('FRONTEND_SUCCESS_URL') ??
        'http://localhost:8100/pago-exitoso';
      const failUrl =
        this.config.get<string>('FRONTEND_FAIL_URL') ??
        'http://localhost:8100/pago-fallido';

      if (result.response_code === 0) {
        console.log('✅ Pago aprobado:', result);

        // 🔹 Actualizar estado del pago y activar suscripción
        await this.paymentsService.confirmPaymentInDB(result);

        return res.redirect(successUrl);
      } else {
        console.log('❌ Pago rechazado:', result);

        // 🔹 Marcar como fallido
        await this.paymentsService.failPaymentInDB(token_ws);

        return res.redirect(failUrl);
      }
    } catch (error) {
      console.error('❌ Error al confirmar pago:', error);
      return res.redirect(
        this.config.get<string>('FRONTEND_FAIL_URL') ??
          'http://localhost:8100/pago-fallido',
      );
    }
  }
}
