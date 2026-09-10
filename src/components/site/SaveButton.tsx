"use client";

import { useEffect, useState } from "react";
import { Heart, Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "./i18n-provider";

const STORAGE_KEY = "jaco:saved";

function loadSaved(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function SaveButton({ id }: { id: string }) {
  const { dict } = useI18n();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setSaved(loadSaved().has(id)), 0);
    return () => window.clearTimeout(t);
  }, [id]);

  const toggle = () => {
    const next = loadSaved();
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    setSaved(next.has(id));
  };

  return (
    <button
      type="button"
      aria-label={`${saved ? dict.save.removeFav : dict.save.addFav}`}
      aria-pressed={saved}
      onClick={toggle}
      className="flex size-11 items-center justify-center gap-1.5 rounded-full border border-line bg-white/95 p-0 text-xs font-semibold text-ink shadow-soft backdrop-blur transition-all duration-150 hover:scale-105 active:scale-95 sm:size-auto sm:px-3 sm:py-2"
    >
      <Heart
        key={saved ? "saved" : "unsaved"}
        className={`heart-pop size-4 transition-colors ${saved ? "fill-coral text-coral" : "text-ink"}`}
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="hidden sm:inline">{saved ? dict.save.saved : dict.save.label}</span>
    </button>
  );
}

export function ShareButton() {
  const { dict } = useI18n();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(dict.save.copiedToast);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* el usuario canceló el share nativo */
    }
  };

  return (
    <button
      type="button"
      aria-label={dict.save.shareAria}
      onClick={share}
      className="flex size-11 items-center justify-center gap-1.5 rounded-full border border-line bg-white p-0 text-xs font-semibold text-ink shadow-soft transition-all duration-150 hover:scale-105 active:scale-95 sm:size-auto sm:px-3 sm:py-2"
    >
      {copied ? (
        <Check className="size-4 text-monte" strokeWidth={1.75} />
      ) : (
        <Share2 className="size-4" strokeWidth={1.75} />
      )}
      <span className="hidden sm:inline">{copied ? dict.save.copied : dict.save.share}</span>
    </button>
  );
}