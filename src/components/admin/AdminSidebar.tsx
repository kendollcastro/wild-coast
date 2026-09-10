"use client";

import { useState } from "react";
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
  Menu,
  Wallet,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { logoutAction } from "@/app/admin/actions";
import { Wordmark } from "@/components/site/Wordmark";

type NavItem = {
  label: string;
  icon: typeof LayoutDashboard;
  href?: string;
  badge?: number;
  disabled?: boolean;
};

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = item.href
    ? item.href === "/admin"
      ? pathname === "/admin"
      : pathname === item.href || pathname.startsWith(`${item.href}/`)
    : false;
  const Icon = item.icon;

  if (item.disabled || !item.href) {
    return (
      <span
        aria-disabled="true"
        title="Próximamente"
        className="flex h-11 cursor-not-allowed items-center gap-3 rounded-lg bg-transparent px-3 text-sm font-medium text-sidebar-muted/50"
      >
        <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
        {item.label}
        <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-muted/60">
          próximo
        </span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150 outline-2 outline-offset-2 focus-visible:outline-white/80 ${
        active
          ? "bg-sidebar-active font-semibold text-white ring-1 ring-inset ring-white/10"
          : "font-medium text-sidebar-muted hover:bg-sidebar-hover hover:text-white"
      }`}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-accent"
        />
      )}
      <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
      {item.label}
      {item.badge !== undefined && item.badge > 0 && (
        <span className="ml-auto shrink-0 rounded-full bg-pina px-2 py-0.5 text-[11px] font-bold leading-4 tabular-nums text-ink">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-6 text-[11px] font-semibold uppercase tracking-widest text-sidebar-muted/60 first:pt-2">
      {children}
    </p>
  );
}

function SidebarBody({
  pendingBookings,
  pendingCommissions,
  adminEmail,
  onNavigate,
}: {
  pendingBookings: number;
  pendingCommissions: number;
  adminEmail?: string | null;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <Link href="/admin" onClick={onNavigate} className="text-lg font-bold tracking-tight text-white">
          jacó<span className="text-coral">.</span>
          <span className="ml-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-sidebar-muted">
            admin
          </span>
        </Link>
      </div>

      <nav aria-label="Panel de administración" className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        <SectionLabel>Panel</SectionLabel>
        <NavLink item={{ label: "Resumen", icon: LayoutDashboard, href: "/admin" }} />

        <SectionLabel>Operación</SectionLabel>
        <NavLink
          item={{ label: "Reservas", icon: CalendarDays, href: "/admin/reservas", badge: pendingBookings }}
        />
        <NavLink
          item={{ label: "Comisiones", icon: Wallet, href: "/admin/comisiones", badge: pendingCommissions }}
        />

        <SectionLabel>Catálogo</SectionLabel>
        <NavLink item={{ label: "Casas", icon: Home, href: "/admin/casas" }} />
        <NavLink item={{ label: "Tours", icon: Compass, href: "/admin/tours" }} />
        <NavLink item={{ label: "Disponibilidad y calendario", icon: CalendarRange, href: "/admin/disponibilidad" }} />

        <SectionLabel>Reportes</SectionLabel>
        <NavLink item={{ label: "Reportes avanzados", icon: BarChart3, href: "/admin/reportes" }} />
      </nav>

      <div className="border-t border-sidebar-border px-2 pt-3">
        {adminEmail && (
          <p className="px-3 pb-3 text-xs font-medium text-sidebar-muted/80">{adminEmail}</p>
        )}
        <Link
          href="/"
          target="_blank"
          className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-muted transition-colors duration-150 hover:bg-sidebar-hover hover:text-white"
        >
          <ExternalLink className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
          Ver sitio
          <span className="ml-auto text-sidebar-muted/60" aria-hidden>
            ↗
          </span>
        </Link>
        <form action={logoutAction} className="pb-[max(env(safe-area-inset-bottom),0.75rem)]">
          <button
            type="submit"
            aria-label="Salir de la administración"
            className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-muted transition-colors duration-150 hover:bg-rojo-deep/20 hover:text-rojo-soft"
          >
            <LogOut className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Salir
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminSidebar({
  pendingBookings,
  pendingCommissions,
  adminEmail,
}: {
  pendingBookings: number;
  pendingCommissions: number;
  adminEmail?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-sidebar-border bg-sidebar-bg text-sidebar-text lg:block">
        <SidebarBody
          pendingBookings={pendingBookings}
          pendingCommissions={pendingCommissions}
          adminEmail={adminEmail}
        />
      </aside>

      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-paper/90 px-4 backdrop-blur md:px-6 lg:hidden">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menú de administración"
                className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-white text-ink"
              >
                <Menu className="size-5" aria-hidden />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 gap-0 border-r-0 bg-sidebar-bg text-sidebar-text p-0" showCloseButton={false}>
              <SheetTitle className="sr-only">Panel de administración</SheetTitle>
              <SidebarBody
                pendingBookings={pendingBookings}
                pendingCommissions={pendingCommissions}
                adminEmail={adminEmail}
                onNavigate={() => setOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <Wordmark />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-mute">
          admin
        </span>
      </div>
    </>
  );
}