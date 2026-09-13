const ONVO_API = "https://api.onvopay.com/v1";

function headers(secretKey: string) {
  return {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  };
}

export async function createPaymentIntent({
  amount,
  currency = "CRC",
  description,
  metadata,
}: {
  amount: number;
  currency?: string;
  description: string;
  metadata?: Record<string, string>;
}) {
  const res = await fetch(`${ONVO_API}/payment-intents`, {
    method: "POST",
    headers: headers(process.env.ONVO_SECRET_KEY!),
    body: JSON.stringify({ amount, currency, description, metadata }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create payment intent");
  }
  return res.json();
}

export async function confirmPaymentIntent({
  paymentIntentId,
  paymentMethodId,
}: {
  paymentIntentId: string;
  paymentMethodId: string;
}) {
  const res = await fetch(`${ONVO_API}/payment-intents/${paymentIntentId}/confirm`, {
    method: "POST",
    headers: headers(process.env.ONVO_SECRET_KEY!),
    body: JSON.stringify({ paymentMethodId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to confirm payment intent");
  }
  return res.json();
}

export async function createPaymentMethod({
  type,
  mobileNumber,
  billing,
}: {
  type: string;
  mobileNumber?: { identification: string; identificationType: number; number: string };
  billing?: { name: string; email?: string };
}) {
  const res = await fetch(`${ONVO_API}/payment-methods`, {
    method: "POST",
    headers: headers(process.env.ONVO_SECRET_KEY!),
    body: JSON.stringify({ type, mobileNumber, billing }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create payment method");
  }
  return res.json();
}

export async function getPaymentIntent(paymentIntentId: string) {
  const res = await fetch(`${ONVO_API}/payment-intents/${paymentIntentId}`, {
    headers: headers(process.env.ONVO_SECRET_KEY!),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to get payment intent");
  }
  return res.json();
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const crypto = require("crypto");
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
