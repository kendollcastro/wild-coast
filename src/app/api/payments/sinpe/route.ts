import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent, confirmPaymentIntent, createPaymentMethod } from "@/lib/onvo";

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, sinpeNumber } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: "paymentIntentId required" }, { status: 400 });
    }

    const method = await createPaymentMethod({
      type: "mobile_number",
      mobileNumber: {
        identification: sinpeNumber ?? "00-0000-0000",
        identificationType: 0,
        number: sinpeNumber ?? "+50600000000",
      },
    });

    const confirmed = await confirmPaymentIntent({
      paymentIntentId,
      paymentMethodId: method.id,
    });

    return NextResponse.json({
      status: confirmed.status,
      sinpeNumber: "+506 70196686",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "SINPE payment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
