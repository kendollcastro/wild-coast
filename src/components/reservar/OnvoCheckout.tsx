"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, CreditCard, Smartphone, CheckCircle2, AlertCircle } from "lucide-react";
import { formatUSD } from "@/lib/format";

declare global {
  interface Window {
    onvo?: {
      pay: (config: Record<string, unknown>) => { render: (selector: string) => void; submitPayment: () => void };
    };
  }
}

type PaymentMethod = "card" | "sinpe";
type PaymentStatus = "idle" | "processing" | "success" | "error";

export function OnvoCheckout({
  paymentIntentId,
  amount,
  description,
  onSuccess,
  onError,
}: {
  paymentIntentId: string;
  amount: number;
  description: string;
  onSuccess: (data: { id: string }) => void;
  onError: (message: string) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [sinpeNumber, setSinpeNumber] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const sdkLoaded = useRef(false);

  const publishableKey = process.env.NEXT_PUBLIC_ONVO_PUBLISHABLE_KEY;

  useEffect(() => {
    if (method !== "card" || !publishableKey) return;
    if (sdkLoaded.current) return;

    const script = document.createElement("script");
    script.src = "https://sdk.onvopay.com/sdk.js";
    script.onload = () => {
      sdkLoaded.current = true;
      renderCardForm();
    };
    document.head.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [method, publishableKey]);

  function renderCardForm() {
    if (!window.onvo || !containerRef.current || !publishableKey) return;
    containerRef.current.innerHTML = "";

    window.onvo
      .pay({
        onError: (data: { message?: string; details?: { card?: { reason?: string } } }) => {
          const card = data?.details?.card;
          if (card?.reason === "issuer_declined") {
            setErrorMsg("La tarjeta fue rechazada. Intentá con otra.");
          } else {
            setErrorMsg(data?.message ?? "Error al procesar la tarjeta.");
          }
          setStatus("error");
        },
        onSuccess: (data: { id: string }) => {
          setStatus("success");
          onSuccess(data);
        },
        publicKey: publishableKey,
        paymentIntentId,
        paymentType: "one_time",
        locale: "es",
      })
      .render("#onvo-card-container");
  }

  async function handleSinpePay() {
    setStatus("processing");
    try {
      const res = await fetch("/api/payments/sinpe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId, sinpeNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al iniciar pago SINPE");
      setSinpeNumber(data.sinpeNumber ?? "+506 70196686");
      setStatus("idle");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al iniciar pago SINPE");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="size-12 text-monte" />
        <p className="text-lg font-semibold text-ink">Pago procesado</p>
        <p className="text-sm text-mute">Recibirás un email de confirmación.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMethod("card")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
            method === "card"
              ? "border-coral bg-coral-soft text-coral-deep"
              : "border-line bg-white text-mute hover:border-ink/20"
          }`}
        >
          <CreditCard className="size-4" />
          Tarjeta
        </button>
        <button
          type="button"
          onClick={() => setMethod("sinpe")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
            method === "sinpe"
              ? "border-coral bg-coral-soft text-coral-deep"
              : "border-line bg-white text-mute hover:border-ink/20"
          }`}
        >
          <Smartphone className="size-4" />
          SINPE Móvil
        </button>
      </div>

      {method === "card" && (
        <div className="rounded-xl border border-line bg-white p-4">
          {publishableKey ? (
            <div id="onvo-card-container" ref={containerRef} />
          ) : (
            <p className="text-sm text-mute">Configurá la llave pública de ONVO para habilitar pagos con tarjeta.</p>
          )}
        </div>
      )}

      {method === "sinpe" && (
        <div className="rounded-xl border border-line bg-white p-5 space-y-4">
          <p className="text-sm text-ink">
            Transferí <b>{formatUSD(amount)}</b> al número SINPE Móvil:
          </p>
          <div className="rounded-xl bg-muted/60 px-4 py-3 text-center">
            <p className="text-xl font-bold tracking-wide text-ink">+506 70196686</p>
            <p className="mt-1 text-xs text-mute">Wild Coast</p>
          </div>
          <p className="text-xs text-mute">
            Usá tu app bancaria para transferir. Incluí tu nombre en la nota.
            Verificamos el pago automáticamente.
          </p>
          {sinpeNumber && (
            <p className="text-sm text-monte font-medium">
              Esperando transferencia al {sinpeNumber}...
            </p>
          )}
          {status !== "processing" && (
            <button
              type="button"
              onClick={handleSinpePay}
              className="btn-primary w-full"
            >
              Iniciar pago SINPE
            </button>
          )}
          {status === "processing" && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-mute">
              <Loader2 className="size-4 animate-spin" /> Procesando...
            </div>
          )}
        </div>
      )}

      {status === "error" && errorMsg && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {errorMsg}
        </div>
      )}
    </div>
  );
}
