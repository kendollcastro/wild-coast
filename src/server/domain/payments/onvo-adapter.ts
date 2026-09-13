import type { PaymentCheckoutResult, PaymentGatewayAdapter } from "./types";

/**
 * ONVO payment adapter for Wild Coast.
 *
 * Creates payment intents via ONVO API. The client-side component
 * handles card tokenization or SINPE Móvil flow, then confirms
 * the intent server-side.
 */
export const onvoPaymentAdapter: PaymentGatewayAdapter = {
  provider: "onvo",

  async createCheckout({ booking, returnUrl }): Promise<PaymentCheckoutResult> {
    try {
      const amount = booking.total_amount ?? 0;
      const description = `Wild Coast — ${booking.booking_type === "property" ? "Casa" : "Tour"} #${booking.id.slice(0, 8)}`;

      const res = await fetch("https://api.onvopay.com/v1/payment-intents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.ONVO_SECRET_KEY!}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "USD",
          description,
          metadata: { bookingId: booking.id },
        }),
      });

      if (!res.ok) {
        console.error("ONVO createCheckout failed:", await res.text());
        return { status: "not_required" };
      }

      const intent = await res.json();

      return {
        status: "requires_action",
        providerReference: intent.id,
        checkoutUrl: `${returnUrl}?payment_intent=${intent.id}`,
      };
    } catch (err) {
      console.error("ONVO createCheckout error:", err);
      return { status: "not_required" };
    }
  },

  async getPaymentStatus(providerReference: string): Promise<PaymentCheckoutResult["status"]> {
    const res = await fetch(`https://api.onvopay.com/v1/payment-intents/${providerReference}`, {
      headers: { Authorization: `Bearer ${process.env.ONVO_SECRET_KEY!}` },
    });
    if (!res.ok) return "not_required";
    const intent = await res.json();
    if (intent.status === "succeeded") return "paid";
    if (intent.status === "requires_action") return "requires_action";
    return "not_required";
  },
};
