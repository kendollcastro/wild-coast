import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/session";
import { getAdminBadgeCounts } from "@/server/domain/admin/service";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdminSession();
  const counts = await getAdminBadgeCounts();

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <AdminSidebar
        pendingBookings={counts.pendingBookings}
        pendingCommissions={counts.pendingCommissions}
        adminEmail={user.email}
      />
      <main id="main" className="lg:pl-60">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}