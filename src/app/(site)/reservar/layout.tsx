import { getDictionary } from "@/i18n/get-dictionary";
import { SiteShell } from "@/components/site/SiteShell";

export default async function ReservarLayout({ children }: { children: React.ReactNode }) {
  const dict = await getDictionary("es");
  return (
    <SiteShell locale="es" dict={dict}>
      {children}
    </SiteShell>
  );
}