import type { PaymentCheckoutResult, PaymentGatewayAdapter } from "./types";

/**
 * Adapter de pago por defecto para el MVP sin cobro real.
 *
 * TODO: payment gateway integration point (Fygaro).
 * Cuando se confirme el proveedor, implementar `PaymentGatewayAdapter` en un
 * archivo nuevo (p.ej. `fygaroAdapter.ts`) y conectarlo acá o desde el service
 * de bookings vía una factory/env flag. No hace falta tocar el resto del flujo.
 */
export const noopPaymentAdapter: PaymentGatewayAdapter = {
  provider: "none",

  async createCheckout(): Promise<PaymentCheckoutResult> {
    // Sin pasarela configurada: el booking queda 'pending' y se confirma
    // manualmente desde el panel admin (o cuando el proveedor se integre).
    return { status: "not_required" };
  },
};

export function getPaymentAdapter(): PaymentGatewayAdapter {
  // TODO: swap por el adapter real según env (p.ej. PAYMENT_PROVIDER=vygaro)
  return noopPaymentAdapter;
}