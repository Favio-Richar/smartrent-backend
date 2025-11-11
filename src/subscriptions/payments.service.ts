// ===============================================================
// 💳 PAYMENTS SERVICE – SmartRent+ (Versión Final y Corregida)
// ---------------------------------------------------------------
// ✅ Transbank SDK oficial (sandbox o producción)
// ✅ Guarda datos completos de cada pago (monto, fecha, token, tipo, etc.)
// ✅ Activa o renueva la suscripción del usuario en la BD
// ===============================================================

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WebpayPlus,
  Options,
  IntegrationCommerceCodes,
  IntegrationApiKeys,
  Environment,
} from 'transbank-sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private options: Options;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const env = this.config.get<string>('WEBPAY_ENV') ?? 'integration';

    // =============================================================
    // 🔹 Configuración de entorno
    // =============================================================
    if (env === 'integration') {
      this.options = new Options(
        IntegrationCommerceCodes.WEBPAY_PLUS,
        IntegrationApiKeys.WEBPAY,
        Environment.Integration,
      );
      console.log('🌍 Webpay en modo integración (sandbox)');
    } else {
      this.options = new Options(
        this.config.get<string>('WEBPAY_COMMERCE_CODE') ?? '',
        this.config.get<string>('WEBPAY_API_KEY') ?? '',
        Environment.Production,
      );
      console.log('🚀 Webpay en modo producción');
    }
  }

  // =============================================================
  // 🔸 Crear transacción WebPay
  // =============================================================
  async createTransaction(
    amount: number,
    sessionId: string,
    buyOrder: string,
    returnUrl: string,
  ) {
    const tx = new WebpayPlus.Transaction(this.options);

    console.log('⚙️ Creando transacción WebPay con:', {
      amount,
      sessionId,
      buyOrder,
      returnUrl,
      environment: this.options.environment,
      commerceCode: this.options.commerceCode,
    });

    try {
      const response = await tx.create(buyOrder, sessionId, amount, returnUrl);

      if (!response?.token) throw new Error('No se recibió token de Transbank');

      console.log('✅ Transacción creada correctamente:', response);

      return {
        token: response.token,
        url: response.url,
      };
    } catch (err) {
      console.error('❌ Error al crear transacción WebPay:', err);
      throw err;
    }
  }

  // =============================================================
  // 🔸 Confirmar transacción WebPay
  // =============================================================
  async commitTransaction(token: string) {
    const tx = new WebpayPlus.Transaction(this.options);
    try {
      const result = await tx.commit(token);
      console.log('💳 Confirmación WebPay:', result);
      return result;
    } catch (err) {
      console.error('❌ Error en commitTransaction:', err);
      await this.failPaymentInDB(token);
      throw err;
    }
  }

  // =============================================================
  // 🔸 Registrar pago pendiente en la BD
  // =============================================================
  async registerPendingPayment(data: {
    userId: number;
    plan: string;
    buyOrder: string;
    amount: number;
    token: string;
  }) {
    try {
      await this.prisma.subscriptionPayment.create({
        data: {
          userId: data.userId,
          plan: data.plan,
          buyOrder: data.buyOrder,
          amount: data.amount,
          token: data.token,
          paymentType: 'WEBPAY',
          status: 'PENDING',
          createdAt: new Date(),
        },
      });
      console.log('🕓 Pago pendiente registrado:', data.buyOrder);
    } catch (err) {
      console.error('❌ Error al registrar pago pendiente:', err);
    }
  }

  // =============================================================
  // 🔸 Confirmar pago, guardar datos y activar suscripción
  // =============================================================
// =============================================================
// 🔸 Confirmar pago y activar suscripción
// =============================================================
async confirmPaymentInDB(result: any) {
  try {
    const token = result.token ?? result.token_ws;
    if (!token) throw new Error('Token no encontrado en resultado WebPay');

    // ✅ Actualizar el registro del pago
    await this.prisma.subscriptionPayment.updateMany({
      where: { token },
      data: {
        status: result.status ?? 'AUTHORIZED',
        authorizationCode: result.authorization_code ?? '-',
        cardLast4: result.card_detail?.card_number ?? '----',
        paymentType: result.payment_type_code ?? 'WEBPAY',
        transactionDate: new Date(result.transaction_date ?? Date.now()),
        confirmedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // ✅ Buscar el pago actualizado
    const pay = await this.prisma.subscriptionPayment.findFirst({
      where: { token },
    });

    if (!pay) {
      console.warn('⚠️ No se encontró el pago en la BD para token:', token);
      return null;
    }

    // 🔹 Crear suscripción activa si no existe
    const existing = await this.prisma.activeSubscription.findFirst({
      where: { userId: pay.userId, status: 'ACTIVE' },
    });

    if (!existing) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      await this.prisma.activeSubscription.create({
        data: {
          userId: pay.userId,
          plan: pay.plan,
          startDate: new Date(),
          endDate,
          status: 'ACTIVE',
        },
      });

      console.log('🌟 Suscripción activada para usuario:', pay.userId);
    } else {
      console.log('🔄 Usuario ya tenía suscripción activa.');
    }

    return pay;
  } catch (err) {
    console.error('❌ Error al confirmar pago en BD:', err);
    return null;
  }
}


  // =============================================================
  // 🔸 Marcar pago fallido
  // =============================================================
  async failPaymentInDB(token: string) {
    try {
      await this.prisma.subscriptionPayment.updateMany({
        where: { token },
        data: { status: 'FAILED' },
      });
      console.log('⚠️ Pago marcado como fallido:', token);
    } catch (err) {
      console.error('❌ Error al marcar pago fallido:', err);
    }
  }

  // =============================================================
  // 🔸 Obtener suscripción activa
  // =============================================================
  async getActiveSubscription(userId: number) {
    return await this.prisma.activeSubscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { endDate: 'desc' },
    });
  }
}
