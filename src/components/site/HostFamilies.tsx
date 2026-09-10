import "server-only";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HandHeart, KeyRound } from "lucide-react";
import type { LocalizedProperty } from "@/server/domain/catalog/localize";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";
import { InView } from "./Reveal";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function HostFamilies({
  properties,
  dict,
  locale,
}: {
  properties: LocalizedProperty[];
  dict: Dictionary;
  locale: Locale;
}) {
  const owners = new Map<string, LocalizedProperty[]>();
  for (const property of properties) {
    const owner = property.owner?.name;
    const key = owner ?? "locals";
    const list = owners.get(key) ?? [];
    list.push(property);
    owners.set(key, list);
  }

  if (owners.size === 0) return null;

  const t = dict.families;

  return (
    <section aria-labelledby="familia-title" className="border-y border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="flex items-center justify-center gap-1.5 eyebrow">
            <HandHeart className="size-3.5 text-mar-deep" aria-hidden />
            {t.eyebrow}
          </p>
          <h2 id="familia-title" className="mt-2 section-title">
            {t.title}
          </h2>
          <p className="mt-3 text-muted-foreground">{t.sub}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...owners.entries()].map(([name, list], i) => {
            const photo = list[0].photos[0];
            return (
              <InView key={name} delay={(i % 3) * 80} className="h-full">
                <div className="card-surface flex h-full flex-col p-6">
                  <div className="flex items-center gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-espuma font-display text-base font-bold text-mar-deep ring-1 ring-espuma-deep">
                      {initials(name)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg font-bold text-ink">{name}</h3>
                      <p className="flex items-center gap-1.5 text-sm text-mute">
                        <KeyRound className="size-3.5" aria-hidden />
                        {t.count.replace("{count}", String(list.length))}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid flex-1 grid-cols-3 gap-2">
                    {list.slice(0, 3).map((property) => {
                      const cover = property.photos[0] ?? photo;
                      return (
                        <Link
                          key={property.id}
                          href={`/${locale}/casas/${property.slug}`}
                          title={property.name}
                          className="group relative block aspect-square overflow-hidden rounded-xl"
                        >
                          {cover ? (
                            <Image
                              src={cover.url}
                              alt={property.name}
                              fill
                              sizes="(max-width: 640px) 30vw, 15vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center bg-muted text-[10px] font-semibold text-muted-foreground">
                              {property.name}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  <Link
                    href={`/${locale}/casas/${list[0].slug}`}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-all hover:border-mar/40 hover:text-mar-deep"
                  >
                    {list.length === 1 ? t.visit.one : t.visit.other}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </InView>
            );
          })}
        </div>
      </div>
    </section>
  );
}