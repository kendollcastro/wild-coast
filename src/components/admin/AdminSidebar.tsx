"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  Compass,
  ExternalLink,
  Home,
  LayoutDashboard,
  LogOut,
  Package,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { logoutAction } from "@/app/admin/actions";
import { Wordmark } from "@/components/site/Wordmark";

type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
};

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const active =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 z-10 h-5 w-1 -translate-y-1/2 rounded-r-full bg-coral group-data-[collapsible=icon]:hidden"
        />
      )}
      {item.badge !== undefined && item.badge > 0 && (
        <SidebarMenuBadge className="bg-pina text-ink">{item.badge}</SidebarMenuBadge>
      )}
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.label}
        onClick={() => setOpenMobile(false)}
        className="h-11 p-3 data-active:bg-coral-soft! data-active:text-coral-deep! data-active:font-semibold"
      >
        <Link href={item.href} aria-current={active ? "page" : undefined}>
          <Icon strokeWidth={1.75} aria-hidden />
          <span className="truncate">{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NavSection({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AdminSidebar({
  pendingBookings,
  pendingCommissions,
  adminEmail,
  children,
}: {
  pendingBookings: number;
  pendingCommissions: number;
  adminEmail?: string | null;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-svh bg-paper text-ink">
        <SidebarProvider>
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" asChild className="gap-2">
                    <Link href="/admin">
                      <span className="text-lg font-bold tracking-tight text-ink">
                        jacó<span className="text-coral">.</span>
                      </span>
                      <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-mute">
                        admin
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
              <NavSection label="Panel" items={[{ label: "Resumen", icon: LayoutDashboard, href: "/admin" }]} />
              <NavSection
                label="Operación"
                items={[
                  { label: "Reservas", icon: CalendarDays, href: "/admin/reservas", badge: pendingBookings },
                  { label: "Comisiones", icon: Wallet, href: "/admin/comisiones", badge: pendingCommissions },
                ]}
              />
              <NavSection
                label="Catálogo"
                items={[
                  { label: "Casas", icon: Home, href: "/admin/casas" },
                  { label: "Tours", icon: Compass, href: "/admin/tours" },
                  { label: "Combos", icon: Package, href: "/admin/combos" },
                  { label: "Disponibilidad y calendario", icon: CalendarRange, href: "/admin/disponibilidad" },
                ]}
              />
              <NavSection
                label="Reportes"
                items={[{ label: "Reportes avanzados", icon: BarChart3, href: "/admin/reportes" }]}
              />
            </SidebarContent>

            <SidebarFooter>
              {adminEmail && <p className="px-2 pb-1 text-xs font-medium text-mute">{adminEmail}</p>}
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Ver sitio" className="h-10 p-3">
                    <Link href="/" target="_blank">
                      <ExternalLink strokeWidth={1.75} aria-hidden />
                      <span className="truncate">Ver sitio</span>
                      <span className="ml-auto text-faint" aria-hidden>
                        ↗
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <form action={logoutAction} className="w-full">
                    <SidebarMenuButton
                      type="submit"
                      tooltip="Salir"
                      aria-label="Salir de la administración"
                      className="h-10 p-3 hover:bg-rojo/10 hover:text-rojo-deep"
                    >
                      <LogOut strokeWidth={1.75} aria-hidden />
                      <span className="truncate">Salir</span>
                    </SidebarMenuButton>
                  </form>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
          </Sidebar>

          <SidebarInset id="main">
            <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-paper/90 px-4 backdrop-blur md:px-6">
              <SidebarTrigger className="text-ink" />
              <div className="md:hidden">
                <Wordmark href="/admin" />
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-mute md:hidden">
                admin
              </span>
            </header>
            <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8 lg:py-8">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </TooltipProvider>
  );
}