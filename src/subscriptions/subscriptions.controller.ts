// ===============================================================
// 💳 SUBSCRIPTIONS CONTROLLER – SmartRent+ (Versión Final Definitiva)
// ---------------------------------------------------------------
// ✅ Crea transacción WebPay
// ✅ Recibe confirmación POST desde WebPay
// ✅ Muestra boleta visual al usuario (HTML)
// ✅ Compatible con backend local o HTTPS (ngrok)
// ===============================================================

import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { randomUUID } from 'crypto';

@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // =============================================================
  // 🔹 Crear transacción WebPay (POST /api/subscriptions/pay)
  // =============================================================
  @Post('pay')
  async createPayment(@Body() body: any) {
    try {
      const { userId, plan } = body;
      if (!userId || !plan)
        throw new HttpException('Faltan datos del pago', HttpStatus.BAD_REQUEST);

      // 💰 Monto según plan
      const amount =
        plan.toLowerCase() === 'premium'
          ? 9990
          : plan.toLowerCase() === 'pro'
          ? 19990
          : 4990;

      const sessionId = randomUUID();
      const buyOrder = 'ORD-' + Date.now();

      // ⚠️ Usa ngrok cuando pruebes desde emulador
     const returnUrl = 'https://mango-fox.ngrok.io/api/subscriptions/confirm';


      // ✅ Crear transacción
      const response = await this.paymentsService.createTransaction(
        amount,
        sessionId,
        buyOrder,
        returnUrl,
      );

      // ✅ Registrar pago pendiente
      await this.paymentsService.registerPendingPayment({
        userId,
        plan,
        buyOrder,
        amount,
        token: response.token,
      });

      console.log('🕓 Transacción creada correctamente:', response.url);

      return {
        url: response.url,
        token: response.token,
        buyOrder,
        amount,
        message: 'Transacción creada correctamente',
      };
    } catch (err) {
      console.error('❌ Error al iniciar pago:', err);
      throw new HttpException(
        'Error interno al crear pago',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =============================================================
  // 🔹 Confirmar transacción WebPay (POST /api/subscriptions/confirm)
  // =============================================================
  @Post('confirm')
  async confirmTransaction(@Body() body, @Res() res: Response) {
    try {
      const token = body.token_ws || body.TBK_TOKEN;
      if (!token) {
        console.error('❌ Token no recibido en confirmación');
        return res
          .status(400)
          .send('<html><body>{"error":"Token no recibido"}</body></html>');
      }

      console.log('🕓 Confirmando transacción con token_ws:', token);

      // ✅ Confirmar con Transbank
      const result = await this.paymentsService.commitTransaction(token);
      console.log('💳 Resultado WebPay:', result);

      // ✅ Actualizar BD y activar suscripción
      await this.paymentsService.confirmPaymentInDB({
        ...result,
        token,
      });

      // ✅ Boleta visual
      const htmlReceipt = `
        <html>
          <head>
            <meta charset="utf-8"/>
            <title>Pago Confirmado</title>
            <style>
              body { font-family: sans-serif; text-align: center; margin-top: 40px; }
              .card { border: 1px solid #ddd; padding: 20px; border-radius: 10px; width: 80%; margin: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              h2 { color: #0c7d4f; }
              p { font-size: 14px; color: #333; }
              .ok { color: #0c7d4f; font-weight: bold; }
              .code { background: #f2f2f2; padding: 5px 10px; border-radius: 5px; display: inline-block; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>✅ Pago Exitoso</h2>
              <p>Plan: <b>${result.buy_order || 'No disponible'}</b></p>
              <p>Monto pagado: <b>$${result.amount?.toLocaleString('es-CL') || '0'}</b></p>
              <p>Fecha: <b>${new Date().toLocaleString('es-CL')}</b></p>
              <p>Código de autorización: <span class="code">${result.authorization_code || '---'}</span></p>
              <p class="ok">Transacción confirmada correctamente</p>
            </div>
          </body>
        </html>
      `;

      return res.status(200).send(htmlReceipt);
    } catch (err) {
      console.error('❌ Error al confirmar pago:', err);
      await this.paymentsService.failPaymentInDB(body.token_ws);
      return res
        .status(400)
        .send(`<html><body>{"error":"${err.message}"}</body></html>`);
    }
  }

  // =============================================================
  // 🔹 Obtener suscripción activa de un usuario
  // =============================================================
  @Get('mine/:userId')
  async getActiveSubscription(@Param('userId') userId: string) {
    const id = parseInt(userId);
    return await this.paymentsService.getActiveSubscription(id);
  }
}
