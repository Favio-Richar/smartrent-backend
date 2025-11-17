import { Controller, Post, Body, Res, Get, Query } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { Response } from "express";

// 👈🔥 CORREGIDO: tu backend YA agrega /api automáticamente en main.ts
@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly payments: PaymentsService) {}

  // ============================================================
  // 🔥 CREATE PAYMENT → Flutter llama aquí
  // ============================================================
  @Post("create")
  async createPayment(@Body() body: any) {
    const { userId, plan } = body;

    const prices = {
      premium: 9990,
      advance: 14990,
      basico: 500, // WebPay necesita un monto válido en pruebas
    };

    const amount = prices[plan?.toLowerCase()] ?? 9990;
    const buyOrder = "ORD-" + Date.now();

    const resp = await this.payments.createTransaction(
      amount,
      String(userId),
      buyOrder
    );

    return {
      url: resp.url,
      token: resp.token,
    };
  }

  // ============================================================
  // 🔥 CONFIRM POST (cuando WebPay devuelve POST)
  // ============================================================
  @Post("confirm")
  async confirmPOST(@Body() body: any, @Res() res: Response) {
    const successURL =
      process.env.FRONTEND_SUCCESS_URL ??
      "smartrent://payment-result?status=success";

    const failURL =
      process.env.FRONTEND_FAIL_URL ??
      "smartrent://payment-result?status=failed";

    const token = body.token_ws;

    // 🔥 WebPay envía TBK_TOKEN cuando el usuario cancela
    if (body.TBK_TOKEN) {
      return res.redirect(failURL);
    }

    if (!token) {
      return res.redirect(failURL);
    }

    const result = await this.payments.commitTransaction(token);

    if (!result || result.status !== "AUTHORIZED") {
      return res.redirect(failURL);
    }

    return res.redirect(successURL);
  }

  // ============================================================
  // 🔥 CONFIRM GET (cuando WebPay devuelve GET)
  // ============================================================
  @Get("confirm")
  async confirmGET(
    @Query("token_ws") token: string,
    @Query("TBK_TOKEN") tbk: string,
    @Res() res: Response
  ) {
    const successURL =
      process.env.FRONTEND_SUCCESS_URL ??
      "smartrent://payment-result?status=success";

    const failURL =
      process.env.FRONTEND_FAIL_URL ??
      "smartrent://payment-result?status=failed";

    // 🔥 usuario cancela pago → llega TBK_TOKEN
    if (tbk) {
      return res.redirect(failURL);
    }

    if (!token) {
      return res.redirect(failURL);
    }

    const result = await this.payments.commitTransaction(token);

    if (!result || result.status !== "AUTHORIZED") {
      return res.redirect(failURL);
    }

    return res.redirect(successURL);
  }
}
