import type { PaymentCheckoutResult, PaymentGatewayAdapter } from "./types";
import { onvoPaymentAdapter } from "./onvo-adapter";

/**
 * Adapter de pago por defecto para el MVP sin cobro real.
 * Cuando ONVO está configurado, se usa el adapter real.
 */
export const noopPaymentAdapter: PaymentGatewayAdapter = {
  provider: "none",

  async createCheckout(): Promise<PaymentCheckoutResult> {
    return { status: "not_required" };
  },
};

export function getPaymentAdapter(): PaymentGatewayAdapter {
  if (process.env.ONVO_SECRET_KEY && !process.env.ONVO_SECRET_KEY.includes("TU_KEY")) {
    return onvoPaymentAdapter;
  }
  return noopPaymentAdapter;
}