import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/onvo";
import { getSupabaseAdmin } from "@/server/db/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("X-Webhook-Secret") ?? "";
    const secret = process.env.ONVO_WEBHOOK_SECRET ?? "";

    if (secret && !verifyWebhookSignature(body, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { type, data } = event;

    if (type === "payment-intent.succeeded") {
      const metadata = data.metadata ?? {};
      const bookingId = metadata.bookingId;

      if (bookingId) {
        await getSupabaseAdmin()
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("id", bookingId);
      }
    }

    if (type === "payment-intent.failed") {
      const metadata = data.metadata ?? {};
      const bookingId = metadata.bookingId;

      if (bookingId) {
        await getSupabaseAdmin()
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", bookingId);
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
