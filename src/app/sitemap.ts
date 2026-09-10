import type { MetadataRoute } from "next";
import { listActiveProperties, listActiveTours } from "@/server/domain/catalog/service";
import { locales } from "@/i18n/config";
import { urlFor } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, tours] = await Promise.all([listActiveProperties(), listActiveTours()]);

const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const push = (
      path: string,
      priority: number,
      changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
    ) =>
      entries.push({
        url: urlFor(locale, path),
        changeFrequency,
        priority,
      });

    push("", 1, "weekly");
    push("casas", 0.9, "daily");
    push("tours", 0.9, "daily");

    for (const p of properties) {
      entries.push({
        url: urlFor(locale, `casas/${p.slug}`),
        changeFrequency: "daily" as const,
        priority: 0.7,
        lastModified: p.updated_at,
      });
    }
    for (const t of tours) {
      entries.push({
        url: urlFor(locale, `tours/${t.slug}`),
        changeFrequency: "daily" as const,
        priority: 0.7,
        lastModified: t.updated_at,
      });
    }
  }

  return entries;
}