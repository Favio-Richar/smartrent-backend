import { Injectable } from "@nestjs/common";
import {
  WebpayPlus,
  Options,
  IntegrationCommerceCodes,
  IntegrationApiKeys,
  Environment,
} from "transbank-sdk";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PaymentsService {
  private options: Options;

  constructor(private prisma: PrismaService) {
    this.options = new Options(
      IntegrationCommerceCodes.WEBPAY_PLUS,
      IntegrationApiKeys.WEBPAY,
      Environment.Integration
    );
  }

  async createTransaction(
    amount: number,
    sessionId: string,
    buyOrder: string
  ) {
    try {
      console.log("🟦 Creando transacción WebPay:");
      console.log(" - Monto:", amount);
      console.log(" - Usuario:", sessionId);
      console.log(" - Orden:", buyOrder);

      const base = process.env.WEBPAY_RETURN_URL_BASE;
      console.log("🟧 WEBPAY_RETURN_URL_BASE =", base);

      if (!base) {
        console.error("❌ ERROR: WEBPAY_RETURN_URL_BASE no definido");
        throw new Error("WEBPAY_RETURN_URL_BASE_MISSING");
      }

      const returnUrl = `${base}/api/subscriptions/confirm`;
      console.log("🟦 RETURN URL =", returnUrl);

      const tx = new WebpayPlus.Transaction(this.options);
      const result = await tx.create(buyOrder, sessionId, amount, returnUrl);

      console.log("🟩 WebPay CREATE OK:", result);

      return {
        url: result.url,
        token: result.token,
      };
    } catch (err) {
      console.error("❌ WebPay createTransaction ERROR:", err);
      throw err;
    }
  }

  async commitTransaction(token: string) {
    try {
      const tx = new WebpayPlus.Transaction(this.options);

      console.log("🟦 Commit WebPay token:", token);

      const result = await tx.commit(token);

      console.log("🟩 WebPay COMMIT OK:", result);

      return result;
    } catch (err) {
      console.error("❌ WebPay commitTransaction ERROR:", err);
      throw err;
    }
  }
}
