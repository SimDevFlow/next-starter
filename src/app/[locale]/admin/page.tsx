import { redirect } from "@/i18n/navigation";
import { getAdminSession } from "@/lib/admin-session";
import type { AdminRole } from "@/types/admin";

const ROLE_HOME: Record<AdminRole, string> = {
  super_admin: "/admin/dashboard",
  bureau: "/admin/bureau",
  cerdotola: "/admin/cerdotola",
  ambassadeur_diaspora: "/admin/ambassadeur",
};

export default async function AdminIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { role } = await getAdminSession();

  redirect({ href: role ? ROLE_HOME[role] : "/login", locale });
}
