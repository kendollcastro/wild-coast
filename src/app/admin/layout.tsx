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
    <AdminSidebar
      pendingBookings={counts.pendingBookings}
      pendingCommissions={counts.pendingCommissions}
      adminEmail={user.email}
    >
      {children}
    </AdminSidebar>
  );
}