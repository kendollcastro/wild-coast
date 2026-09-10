import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/es";
import en from "./dictionaries/en";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  es: () => import("./dictionaries/es").then((m) => m.default),
  en: () => Promise.resolve(en),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}