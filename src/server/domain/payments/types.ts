import type { BookingsRow } from "@/server/db/schema.types";

/**
 * Abstracción de pasarela de pago.
 *
 * El flujo de reserva depende de esta interfaz y NO de un proveedor concreto.
 * El futuro adapter de Fygaro debe implementar esta interfaz sin tocar el resto
 * del flujo de bookings.
 */
export interface PaymentCheckout {
  booking: BookingsRow;
  returnUrl: string;
}

export type PaymentResultStatus =
  | "not_required" // MVP: sin proveedor de pago; la reserva queda pendiente de confirmación
  | "requires_action" // redirigir al huésped a una URL de pago del proveedor
  | "paid"; // pago confirmado; habilitaría confirmar la reserva automáticamente

export interface PaymentCheckoutResult {
  status: PaymentResultStatus;
  checkoutUrl?: string;
  /** Id/ref del pago en el proveedor (para conciliación posterior). */
  providerReference?: string;
}

export interface PaymentGatewayAdapter {
  /** Nombre del proveedor: 'none' hasta integrar Fygaro. */
  readonly provider: string;
  createCheckout(input: PaymentCheckout): Promise<PaymentCheckoutResult>;
  /** Recuperar/verificar el estado de un pago iniciado. (opcional en MVP) */
  getPaymentStatus?(providerReference: string): Promise<PaymentResultStatus>;
}