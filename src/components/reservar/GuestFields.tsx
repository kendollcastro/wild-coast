"use client";

import { useFormStatus } from "react-dom";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={disabled || pending} className="btn-primary w-full">
      {pending ? "Enviando…" : "Enviar solicitud de reserva"}
    </button>
  );
}

type Props = {
  error?: string | null;
  disabled?: boolean;
};

export function GuestFields({ error, disabled = false }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="guest_name" className="field-label">
            Nombre completo *
          </label>
          <input
            id="guest_name"
            name="guest_name"
            type="text"
            required
            autoComplete="name"
            placeholder="p. ej. Ana Salazar"
            className="field mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="guest_email" className="field-label">
            Email *
          </label>
          <input
            id="guest_email"
            name="guest_email"
            type="email"
            required
            autoComplete="email"
            placeholder="ana@correo.com"
            className="field mt-1.5"
          />
        </div>
      </div>

      <div>
        <label htmlFor="guest_phone" className="field-label">
          Teléfono / WhatsApp
        </label>
        <input
          id="guest_phone"
          name="guest_phone"
          type="tel"
          autoComplete="tel"
          placeholder="+506 8888 8888"
          className="field mt-1.5"
        />
      </div>

      <div>
        <label htmlFor="notes" className="field-label">
          Algo que debamos saber
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="hora de llegada, niños, alergias, lo que sea"
          className="field mt-1.5 resize-y"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}

      <p className="text-xs text-mute">
        El envío no genera ningún cobro. Primero pedimos confirmación al anfitrión.
      </p>

      <SubmitButton disabled={disabled} />
    </div>
  );
}