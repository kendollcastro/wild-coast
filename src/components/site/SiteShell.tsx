import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";
import { I18nProvider } from "./i18n-provider";
import { HtmlLang } from "./HtmlLang";
import { MainNav } from "./MainNav";
import { SiteFooter } from "./SiteFooter";
import { StickyCTA } from "./StickyCTA";

export function SiteShell({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <div lang={locale} className="contents">
      <HtmlLang locale={locale} />
      <I18nProvider locale={locale} dict={dict}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          {dict.skip}
        </a>
        <MainNav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter dict={dict} locale={locale} />
        <StickyCTA />
      </I18nProvider>
    </div>
  );
}